// Service for payment (boleta quincenal) persistence and business rules.
import Payment from "../models/Payment";
import Employee from "../models/Employee";
import {
  calculateBiweeklyBreakdown,
  computeTotalPayable,
  PaymentOverrides,
  round2,
} from "./paymentCalculationService";
import { ServiceError } from "../utils/errors";
import { paginate, getPaginationParams, QueryParams } from "../utils/pagination";

const AMOUNT_FIELDS = [
  "regularSalary",
  "overtimePay",
  "mileage",
  "others",
  "socialCharges",
  "deductions",
  "totalPayable",
] as const;

// Sequelize returns DECIMAL columns as strings — normalize to numbers so the
// API always speaks JSON numbers.
export const serializePayment = <T extends Record<string, any>>(payment: T) => {
  const plain =
    typeof payment.get === "function"
      ? (payment.get({ plain: true }) as Record<string, any>)
      : { ...payment };

  AMOUNT_FIELDS.forEach((field) => {
    if (plain[field] !== null && plain[field] !== undefined) {
      plain[field] = Number(plain[field]);
    }
  });
  if (plain.employee && plain.employee.hourlyRate != null) {
    plain.employee.hourlyRate = Number(plain.employee.hourlyRate);
  }
  return plain;
};

const employeeInclude = {
  model: Employee,
  as: "employee",
  attributes: ["id", "firstName", "lastName", "email", "avatar", "hourlyRate"],
};

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

// Creates a payment: the breakdown is always computed server-side (hours ×
// hourlyRate); explicit amount fields in the input act as manual overrides.
export const createPayment = async (input: CreatePaymentInput) => {
  const { employeeId, biweekNumber, year, payDate, notes, ...overrides } = input;

  const overrideKeys = Object.keys(overrides).filter(
    (key) => (overrides as Record<string, unknown>)[key] !== undefined,
  );

  const existing = await Payment.findOne({
    where: { employeeId, biweekNumber, year, payPeriod: "biweekly" },
  });
  if (existing) {
    throw new ServiceError(409, "Ya existe un pago para ese empleado en esa quincena");
  }

  const breakdown = await calculateBiweeklyBreakdown(employeeId, biweekNumber, year, overrides);

  const created = await Payment.create({
    employeeId,
    payPeriod: "biweekly",
    biweekNumber,
    year,
    payDate: payDate || null,
    currency: "CRC",
    regularSalary: breakdown.regularSalary,
    overtimePay: breakdown.overtimePay,
    mileage: breakdown.mileage,
    others: breakdown.others,
    socialCharges: breakdown.socialCharges,
    deductions: breakdown.deductions,
    totalPayable: breakdown.totalPayable,
    notes: notes || null,
    status: "pending",
    isManual: overrideKeys.length > 0,
  });

  return serializePayment(created.get({ plain: true }));
};

export interface UpdatePaymentInput extends PaymentOverrides {
  payDate?: string | null;
  notes?: string | null;
  status?: "pending" | "cancelled";
}

// Partial update. Amount changes recompute the total and flag the payment as
// manually edited; the "sent" status can only be set by the email endpoint.
export const updatePayment = async (id: number, input: UpdatePaymentInput) => {
  const payment = await Payment.findByPk(id);
  if (!payment) return null;

  const { payDate, notes, status, ...amountOverrides } = input;

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

  const amountKeys = Object.keys(amountOverrides).filter(
    (key) => (amountOverrides as Record<string, unknown>)[key] !== undefined,
  );
  if (amountKeys.length > 0) {
    const current = {
      regularSalary: Number(payment.regularSalary),
      overtimePay: Number(payment.overtimePay),
      mileage: Number(payment.mileage),
      others: Number(payment.others),
      socialCharges: Number(payment.socialCharges),
      deductions: Number(payment.deductions),
    };
    amountKeys.forEach((key) => {
      (current as Record<string, number>)[key] = round2(
        Number((amountOverrides as Record<string, number>)[key]),
      );
    });
    Object.assign(updates, current, {
      totalPayable: computeTotalPayable(current),
      isManual: true,
    });
  }

  await payment.update(updates);
  return serializePayment(payment.get({ plain: true }));
};

// Recomputes the regular salary from the current hours × hourlyRate, keeps the
// manually-entered optional amounts, recomputes the total and clears isManual.
export const recalculatePayment = async (id: number) => {
  const payment = await Payment.findByPk(id);
  if (!payment) return null;

  const breakdown = await calculateBiweeklyBreakdown(
    payment.employeeId,
    payment.biweekNumber,
    payment.year,
    {
      overtimePay: Number(payment.overtimePay),
      mileage: Number(payment.mileage),
      others: Number(payment.others),
      socialCharges: Number(payment.socialCharges),
      deductions: Number(payment.deductions),
    },
  );

  await payment.update({
    regularSalary: breakdown.regularSalary,
    totalPayable: breakdown.totalPayable,
    isManual: false,
  });
  return serializePayment(payment.get({ plain: true }));
};

// Marks a payment as emailed to the employee (called after a successful send).
export const markPaymentSent = async (id: number) => {
  const payment = await Payment.findByPk(id);
  if (!payment) return null;

  await payment.update({ status: "sent", emailSentAt: new Date() });
  return serializePayment(payment.get({ plain: true }));
};

// Deletes a payment by ID.
export const deletePayment = async (id: number) => {
  const deleted = await Payment.destroy({ where: { id } });
  return deleted > 0;
};
