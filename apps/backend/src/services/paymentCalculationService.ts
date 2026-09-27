// Biweekly pay calculation (boleta quincenal).
//
// Every amount of a pay slip has an automatic value and can be overridden by
// hand, field by field:
//  - Salario ordinario:      min(hours, regular threshold) × hourlyRate
//  - Salario extraordinario: hours above the threshold × hourlyRate × 1.5
//  - Cargas sociales:        (ordinario + extraordinario) × CCSS worker rate
//  - Kilometraje, Otros, Rebajos: no data source → 0 until typed by hand
// Hours come from hours_worked (source of truth). The total is always
// recomputed server-side so it can never drift from its parts.
import Employee from "../models/Employee";
import { getBiweeklyDates, loadEmployeeHours, sumHours } from "./summaryRecalculationService";
import { ServiceError } from "../utils/errors";

// Rounds to 2 decimals (matches the DECIMAL(12,2) column precision).
export const round2 = (value: number): number => Math.round(value * 100) / 100;

const envNumber = (name: string, fallback: number): number => {
  const raw = process.env[name];
  const parsed = raw !== undefined && raw !== "" ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

/**
 * Payroll rules. Defaults follow Costa Rica: 48 h/week ordinary time (96 h per
 * quincena, the same threshold the hours board uses for "horas extra"),
 * overtime paid at time-and-a-half (Código de Trabajo art. 139) and the CCSS
 * worker contribution of 10.83 % (SEM 5.50 + IVM 4.33 + Banco Popular 1.00).
 * Each can be tuned per deployment through the environment.
 */
export const getPayrollRules = () => ({
  regularHoursPerBiweek: envNumber("PAYROLL_REGULAR_HOURS_PER_BIWEEK", 96),
  overtimeMultiplier: envNumber("PAYROLL_OVERTIME_MULTIPLIER", 1.5),
  socialChargesRate: envNumber("PAYROLL_SOCIAL_CHARGES_RATE", 0.1083),
});

export const AMOUNT_FIELDS = [
  "regularSalary",
  "overtimePay",
  "mileage",
  "others",
  "socialCharges",
  "deductions",
] as const;

export type AmountField = (typeof AMOUNT_FIELDS)[number];

export const isAmountField = (value: unknown): value is AmountField =>
  typeof value === "string" && (AMOUNT_FIELDS as readonly string[]).includes(value);

export type PaymentAmounts = Record<AmountField, number>;

// Manual values keyed by field — undefined = use the automatic value.
export type PaymentOverrides = Partial<PaymentAmounts>;

export interface PaymentBreakdown extends PaymentAmounts {
  employeeId: number;
  biweekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  hoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  hourlyRate: number | null;
  socialChargesRate: number;
  overtimeMultiplier: number;
  totalPayable: number;
  /** Fields whose value came from an override (manual). */
  manualFields: AmountField[];
}

// total = earnings (ordinario + extraordinario + kilometraje + otros)
//       − deductions (cargas sociales + rebajos)
export const computeTotalPayable = (amounts: PaymentAmounts): number =>
  round2(
    amounts.regularSalary +
      amounts.overtimePay +
      amounts.mileage +
      amounts.others -
      amounts.socialCharges -
      amounts.deductions,
  );

/**
 * Pure amount resolution: automatic values from hours × rate, then manual
 * overrides field by field. Social charges are derived from the FINAL
 * ordinary + overtime salary, so editing the salary by hand keeps the
 * automatic social charges consistent with it.
 */
export const resolveAmounts = (
  hoursWorked: number,
  hourlyRate: number | null,
  overrides: PaymentOverrides = {},
) => {
  const rules = getPayrollRules();
  const regularHours = round2(Math.min(hoursWorked, rules.regularHoursPerBiweek));
  const overtimeHours = round2(Math.max(0, hoursWorked - rules.regularHoursPerBiweek));
  const rate = hourlyRate ?? 0;

  const pick = (field: AmountField, automatic: number): number =>
    overrides[field] !== undefined && overrides[field] !== null
      ? round2(Number(overrides[field]))
      : round2(automatic);

  const regularSalary = pick("regularSalary", regularHours * rate);
  const overtimePay = pick("overtimePay", overtimeHours * rate * rules.overtimeMultiplier);
  const amounts: PaymentAmounts = {
    regularSalary,
    overtimePay,
    mileage: pick("mileage", 0),
    others: pick("others", 0),
    socialCharges: pick("socialCharges", (regularSalary + overtimePay) * rules.socialChargesRate),
    deductions: pick("deductions", 0),
  };

  const manualFields = AMOUNT_FIELDS.filter(
    (field) => overrides[field] !== undefined && overrides[field] !== null,
  );

  return {
    amounts,
    regularHours,
    overtimeHours,
    manualFields,
    totalPayable: computeTotalPayable(amounts),
    rules,
  };
};

const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const assertValidPeriod = (biweekNumber: number, year: number): void => {
  if (!Number.isInteger(biweekNumber) || biweekNumber < 1 || biweekNumber > 24) {
    throw new ServiceError(400, "biweekNumber debe estar entre 1 y 24");
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new ServiceError(400, "year debe estar entre 2000 y 2100");
  }
};

/** Hours worked by an employee in a quincena (hours_worked × schedules). */
export const getBiweeklyHours = async (
  employeeId: number,
  biweekNumber: number,
  year: number,
): Promise<number> => {
  const { startDate, endDate } = getBiweeklyDates(year, biweekNumber);
  const rows = await loadEmployeeHours(employeeId, startOfDay(startDate), endOfDay(endDate));
  return round2(sumHours(rows));
};

/**
 * Full breakdown for an employee's quincena: hours, automatic amounts and the
 * given manual overrides applied on top.
 */
export const calculateBiweeklyBreakdown = async (
  employeeId: number,
  biweekNumber: number,
  year: number,
  overrides: PaymentOverrides = {},
): Promise<PaymentBreakdown> => {
  assertValidPeriod(biweekNumber, year);

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  const hourlyRate = employee.hourlyRate != null ? Number(employee.hourlyRate) : null;
  const hoursWorked = await getBiweeklyHours(employeeId, biweekNumber, year);
  const { startDate, endDate } = getBiweeklyDates(year, biweekNumber);
  const resolved = resolveAmounts(hoursWorked, hourlyRate, overrides);

  return {
    employeeId,
    biweekNumber,
    year,
    startDate: toISODate(startDate),
    endDate: toISODate(endDate),
    hoursWorked,
    regularHours: resolved.regularHours,
    overtimeHours: resolved.overtimeHours,
    hourlyRate,
    socialChargesRate: resolved.rules.socialChargesRate,
    overtimeMultiplier: resolved.rules.overtimeMultiplier,
    ...resolved.amounts,
    totalPayable: resolved.totalPayable,
    manualFields: resolved.manualFields,
  };
};
