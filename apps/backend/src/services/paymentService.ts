// Service for payment (boleta quincenal) persistence and business rules.
//
// A pay slip is filled automatically from the hours of its quincena and can be
// edited by hand field by field. `manualFields` records which amounts were
// typed by hand: every automatic refresh (job, "Recalcular", hours changes)
// only recomputes the other fields, so manual edits always stick until the
// user explicitly sets a field back to automatic.
import Payment from "../models/Payment";
import Employee from "../models/Employee";
import {
  AmountField,
  AMOUNT_FIELDS,
  assertValidPeriod,
  calculateBiweeklyBreakdown,
  getPayrollRules,
  isAmountField,
  PaymentBreakdown,
  PaymentOverrides,
} from "./paymentCalculationService";
import { getBiweeklyDates } from "./summaryRecalculationService";
import { ServiceError } from "../utils/errors";
import { paginate, getPaginationParams, QueryParams } from "../utils/pagination";
import { notifyEmployeeUser, notifyManagementRoles } from "./notificationService";

const NUMERIC_FIELDS = [
  ...AMOUNT_FIELDS,
  "totalPayable",
  "hoursWorked",
  "overtimeHours",
  "hourlyRate",
] as const;

// Sequelize returns DECIMAL columns as strings — normalize to numbers so the
// API always speaks JSON numbers.
export const serializePayment = <T extends Record<string, any>>(payment: T) => {
  const plain =
    typeof payment.get === "function"
      ? (payment.get({ plain: true }) as Record<string, any>)
      : { ...payment };

  NUMERIC_FIELDS.forEach((field) => {
    if (plain[field] !== null && plain[field] !== undefined) {
      plain[field] = Number(plain[field]);
    }
  });
  plain.manualFields = Array.isArray(plain.manualFields)
    ? plain.manualFields.filter(isAmountField)
    : [];
  if (plain.employee && plain.employee.hourlyRate != null) {
    plain.employee.hourlyRate = Number(plain.employee.hourlyRate);
  }
  // Current rules, so the slip editor can preview automatic amounts live.
  const rules = getPayrollRules();
  plain.socialChargesRate = rules.socialChargesRate;
  plain.overtimeMultiplier = rules.overtimeMultiplier;
  return plain;
};

const employeeInclude = {
  model: Employee,
  as: "employee",
  attributes: ["id", "firstName", "lastName", "email", "avatar", "hourlyRate", "nationalId"],
};

// Columns written from a breakdown (amounts + the data they came from).
const breakdownColumns = (breakdown: PaymentBreakdown) => ({
  regularSalary: breakdown.regularSalary,
  overtimePay: breakdown.overtimePay,
  mileage: breakdown.mileage,
  others: breakdown.others,
  socialCharges: breakdown.socialCharges,
  deductions: breakdown.deductions,
  totalPayable: breakdown.totalPayable,
  hoursWorked: breakdown.hoursWorked,
  overtimeHours: breakdown.overtimeHours,
  hourlyRate: breakdown.hourlyRate,
  manualFields: breakdown.manualFields,
  isManual: breakdown.manualFields.length > 0,
});

const storedManualFields = (payment: Payment): AmountField[] =>
  Array.isArray(payment.manualFields) ? payment.manualFields.filter(isAmountField) : [];

// Overrides that keep the stored value of every manual field.
const manualOverrides = (payment: Payment, fields: Iterable<AmountField>): PaymentOverrides => {
  const overrides: PaymentOverrides = {};
  Array.from(fields).forEach((field) => {
    overrides[field] = Number(payment[field]);
  });
  return overrides;
};

const amountsDiffer = (payment: Payment, breakdown: PaymentBreakdown): boolean =>
  [...AMOUNT_FIELDS, "totalPayable" as const].some(
    (field) => Number(payment[field]) !== Number(breakdown[field]),
  );

// Fetches payments (paginated) with the employee's identity, newest period first.
export const getPayments = async (query: QueryParams) => {
  const params = getPaginationParams(query);

  const where: Record<string, any> = {};
  if (query.employeeId) where.employeeId = parseInt(query.employeeId, 10);
  if (query.year) where.year = parseInt(query.year, 10);
  if (query.biweekNumber) where.biweekNumber = parseInt(query.biweekNumber, 10);
  if (query.status) where.status = query.status;

  const result = await paginate<Payment>(
    Payment,
    {
      where,
      include: [employeeInclude],
      order: [
        ["year", "DESC"],
        ["biweekNumber", "DESC"],
        ["id", "DESC"],
      ],
    },
    params,
  );

  return { ...result, data: result.data.map(serializePayment) };
};

// Fetches a single payment with its employee.
export const getPaymentById = async (id: number) => {
  const payment = await Payment.findByPk(id, { include: [employeeInclude] });
  return payment ? serializePayment(payment) : null;
};

export interface CreatePaymentInput extends PaymentOverrides {
  employeeId: number;
  biweekNumber: number;
  year: number;
  payDate?: string | null;
  notes?: string | null;
}

const pickOverrides = (input: Record<string, unknown>): PaymentOverrides => {
  const overrides: PaymentOverrides = {};
  AMOUNT_FIELDS.forEach((field) => {
    const value = input[field];
    if (value !== undefined && value !== null && value !== "") {
      overrides[field] = Number(value);
    }
  });
  return overrides;
};

const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

// Default pay date of a quincena: its last day (15th / end of month).
const defaultPayDate = (biweekNumber: number, year: number): string =>
  toISODate(getBiweeklyDates(year, biweekNumber).endDate);

// Creates a payment: amounts are computed server-side; explicit amount fields
// in the input are stored as manual values.
export const createPayment = async (
  input: CreatePaymentInput,
  options: { autoGenerated?: boolean } = {},
) => {
  const { employeeId, biweekNumber, year, payDate, notes } = input;

  const existing = await Payment.findOne({
    where: { employeeId, biweekNumber, year, payPeriod: "biweekly" },
  });
  if (existing) {
    throw new ServiceError(409, "Ya existe un pago para ese empleado en esa quincena");
  }

  const breakdown = await calculateBiweeklyBreakdown(
    employeeId,
    biweekNumber,
    year,
    pickOverrides(input as unknown as Record<string, unknown>),
  );

  const created = await Payment.create({
    employeeId,
    payPeriod: "biweekly",
    biweekNumber,
    year,
    payDate: payDate || defaultPayDate(biweekNumber, year),
    currency: "CRC",
    ...breakdownColumns(breakdown),
    notes: notes || null,
    status: "pending",
    autoGenerated: options.autoGenerated ?? false,
  });

  // Las boletas automáticas se resumen en un solo aviso ("Boletas generadas").
  if (!options.autoGenerated) {
    const employee = await Employee.findByPk(employeeId, {
      attributes: ["id", "firstName", "lastName"],
    });
    const name = employee ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() : "";
    await notifyManagementRoles({
      source: `boleta-created:${created.id}`,
      title: "Boleta de pago creada",
      message: `Se creó la boleta de ${name || `el empleado #${employeeId}`} (Q${biweekNumber}/${year}).`,
      type: "info",
      category: "report",
      priority: "low",
      actionUrl: `/employees/${employeeId}?tab=pagos`,
      actionText: "Ver boleta",
    });
  }

  return serializePayment(created.get({ plain: true }));
};

export interface UpdatePaymentInput extends PaymentOverrides {
  payDate?: string | null;
  notes?: string | null;
  status?: "pending" | "cancelled";
  /** Amount fields to return to their automatic value. */
  automaticFields?: string[];
}

// Partial update. Typed amounts become manual; `automaticFields` returns
// fields to automatic. Automatic fields are recomputed from the current hours
// so the slip stays consistent. Changing the amounts of a slip that was
// already emailed sets it back to "pending" (it must be sent again).
export const updatePayment = async (id: number, input: UpdatePaymentInput) => {
  const payment = await Payment.findByPk(id);
  if (!payment) return null;

  const { payDate, notes, status, automaticFields } = input;

  if (status !== undefined && status !== "pending" && status !== "cancelled") {
    throw new ServiceError(
      400,
      "Solo los estados 'pending' y 'cancelled' se pueden editar manualmente",
    );
  }

  const updates: Record<string, unknown> = {};
  if (payDate !== undefined) updates.payDate = payDate;
  if (notes !== undefined) updates.notes = notes;
  if (status !== undefined) updates.status = status;

  const typed = pickOverrides(input as unknown as Record<string, unknown>);
  const resetFields = (automaticFields ?? []).filter(isAmountField);

  if (Object.keys(typed).length > 0 || resetFields.length > 0) {
    const manual = new Set<AmountField>(storedManualFields(payment));
    (Object.keys(typed) as AmountField[]).forEach((field) => manual.add(field));
    resetFields.forEach((field) => manual.delete(field));

    const overrides: PaymentOverrides = {
      ...manualOverrides(payment, manual),
      ...Object.fromEntries(
        Object.entries(typed).filter(([field]) => manual.has(field as AmountField)),
      ),
    };

    const breakdown = await calculateBiweeklyBreakdown(
      payment.employeeId,
      payment.biweekNumber,
      payment.year,
      overrides,
    );

    if (payment.status === "sent" && status === undefined && amountsDiffer(payment, breakdown)) {
      updates.status = "pending";
    }
    Object.assign(updates, breakdownColumns(breakdown));
  }

  await payment.update(updates);

  if (updates.status === "pending" && payment.status === "sent") {
    await notifyEmployeeUser(payment.employeeId, {
      source: `boleta-updated:${id}:${Date.now()}`,
      title: "Tu boleta fue modificada",
      message: `Tu boleta del periodo Q${payment.biweekNumber}/${payment.year} cambió y debe reenviarse.`,
      type: "warning",
      category: "report",
      priority: "medium",
      actionUrl: "/mi-panel?tab=pagos",
      actionText: "Ver mi boleta",
    });
  }

  return serializePayment(payment.get({ plain: true }));
};

// Sequelize 4 typings do not declare instance methods on the model class.
type PaymentRecord = Payment & {
  update: (values: Record<string, unknown>) => Promise<unknown>;
};

// Recomputes the automatic amounts from the current hours × hourlyRate and
// keeps every manual value.
export const refreshPaymentAmounts = async (payment: PaymentRecord) => {
  const breakdown = await calculateBiweeklyBreakdown(
    payment.employeeId,
    payment.biweekNumber,
    payment.year,
    manualOverrides(payment, storedManualFields(payment)),
  );
  const changed = amountsDiffer(payment, breakdown);
  const updates: Record<string, unknown> = breakdownColumns(breakdown);
  if (payment.status === "sent" && changed) updates.status = "pending";
  await payment.update(updates);
  return { payment, changed };
};

// "Recalcular" from the UI: refresh automatic fields, keep manual ones.
export const recalculatePayment = async (id: number) => {
  const payment = await Payment.findByPk(id);
  if (!payment) return null;

  await refreshPaymentAmounts(payment as PaymentRecord);
  return serializePayment(payment.get({ plain: true }));
};

// Marks a payment as emailed to the employee (called after a successful send).
export const markPaymentSent = async (id: number) => {
  const payment = await Payment.findByPk(id);
  if (!payment) return null;

  await payment.update({ status: "sent", emailSentAt: new Date() });

  // Tell the employee their boleta was sent so the flow is bidirectional.
  await notifyEmployeeUser(payment.employeeId, {
    source: `boleta-sent:${payment.id}:${Date.now()}`,
    title: "Boleta de pago enviada",
    message: `Tu boleta de la quincena ${payment.biweekNumber} de ${payment.year} fue enviada a tu correo.`,
    type: "success",
    category: "employee",
    priority: "low",
    actionUrl: "/mi-panel?tab=pagos",
    actionText: "Ver mi boleta",
  });

  return serializePayment(payment.get({ plain: true }));
};

// Deletes a payment by ID.
export const deletePayment = async (id: number) => {
  // Se lee antes de borrar para poder avisarle al empleado afectado.
  const payment = await Payment.findByPk(id, { attributes: ["id", "employeeId"] });
  const deleted = await Payment.destroy({ where: { id } });
  if (deleted > 0) {
    await notifyManagementRoles({
      source: `boleta-deleted:${id}`,
      title: "Boleta eliminada",
      message: `Se eliminó la boleta #${id}.`,
      type: "warning",
      category: "report",
      priority: "medium",
      actionUrl: payment ? `/employees/${payment.employeeId}?tab=pagos` : "/employees",
      actionText: "Ver boletas",
    });
    if (payment) {
      await notifyEmployeeUser(payment.employeeId, {
        source: `boleta-deleted-employee:${id}`,
        title: "Se eliminó una boleta de tu historial",
        message: `La boleta #${id} fue eliminada de tu expediente.`,
        type: "warning",
        category: "report",
        priority: "medium",
        actionUrl: "/mi-panel?tab=pagos",
        actionText: "Ver mi pagos",
      });
    }
  }
  return deleted > 0;
};

const isUniqueViolation = (error: unknown): boolean =>
  (error as { name?: string })?.name === "SequelizeUniqueConstraintError";

export interface GenerationResult {
  year: number;
  biweekNumber: number;
  created: number;
  refreshed: number;
  skipped: number;
}

/**
 * Fills the pay slips of a quincena for every employee who worked in it:
 *  - no slip yet and hours > 0 → created automatically (autoGenerated)
 *  - pending slip → automatic amounts refreshed (manual ones kept)
 *  - sent / cancelled slips are never touched
 * Terminated employees still get the slip of the quincena they left in.
 * Idempotent: safe to run as often as needed.
 */
export const generateBiweeklyPayments = async (
  year: number,
  biweekNumber: number,
): Promise<GenerationResult> => {
  assertValidPeriod(biweekNumber, year);
  const { startDate, endDate } = getBiweeklyDates(year, biweekNumber);
  const periodStart = toISODate(startDate);
  const periodEnd = toISODate(endDate);

  const [employees, existing] = await Promise.all([
    Employee.findAll({
      attributes: ["id", "isActive", "terminationDate", "contractStartDate"],
    }),
    Payment.findAll({ where: { year, biweekNumber, payPeriod: "biweekly" } }),
  ]);
  const byEmployee = new Map(existing.map((payment) => [payment.employeeId, payment]));

  const result: GenerationResult = { year, biweekNumber, created: 0, refreshed: 0, skipped: 0 };

  const fillEmployeeSlip = async (
    employee: Employee,
    payment: Payment | undefined,
  ): Promise<"created" | "refreshed" | "skipped"> => {
    if (payment) {
      if (payment.status !== "pending") return "skipped";
      const { changed } = await refreshPaymentAmounts(payment as PaymentRecord);
      return changed ? "refreshed" : "skipped";
    }

    const employed =
      (employee.isActive || (employee.terminationDate ?? "") >= periodStart) &&
      (!employee.contractStartDate || employee.contractStartDate <= periodEnd);
    if (!employed) return "skipped";

    const breakdown = await calculateBiweeklyBreakdown(employee.id, biweekNumber, year);
    if (breakdown.hoursWorked <= 0) return "skipped";

    await Payment.create({
      employeeId: employee.id,
      payPeriod: "biweekly",
      biweekNumber,
      year,
      payDate: periodEnd,
      currency: "CRC",
      ...breakdownColumns(breakdown),
      notes: null,
      status: "pending",
      autoGenerated: true,
    });
    return "created";
  };

  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const employee of employees) {
    try {
      result[await fillEmployeeSlip(employee, byEmployee.get(employee.id))] += 1;
    } catch (error) {
      // A concurrent run created it first — nothing to do.
      if (!isUniqueViolation(error)) throw error;
      result.skipped += 1;
    }
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */

  if (result.created > 0) {
    await notifyManagementRoles({
      source: `boletas-generated:${year}-${biweekNumber}`,
      title: "Boletas generadas",
      message: `Se generaron ${result.created} boleta(s) para la quincena ${biweekNumber}/${year}.`,
      type: "info",
      category: "report",
      priority: "low",
      actionUrl: "/employees",
      actionText: "Ver boletas",
    });
  }

  return result;
};
