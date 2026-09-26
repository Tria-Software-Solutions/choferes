// Biweekly pay calculation.
//
// The regular salary of a quincena is derived data: hours worked in the period
// (hours_worked rows, source of truth) × the employee's hourly rate. Optional
// amounts (overtime, mileage, others, social charges, deductions) have no data
// source in this app, so they start at 0 and are edited by hand; the total is
// always recomputed server-side so it can never drift from its parts.
import Employee from "../models/Employee";
import { getBiweeklyDates, loadEmployeeHours, sumHours } from "./summaryRecalculationService";
import { ServiceError } from "../utils/errors";

// Rounds to 2 decimals (matches the DECIMAL(12,2) column precision).
export const round2 = (value: number): number => Math.round(value * 100) / 100;

export interface PaymentAmounts {
  regularSalary: number;
  overtimePay: number;
  mileage: number;
  others: number;
  socialCharges: number;
  deductions: number;
}

export interface PaymentBreakdown extends PaymentAmounts {
  employeeId: number;
  biweekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  hoursWorked: number;
  hourlyRate: number | null;
  totalPayable: number;
}

// total = earnings (regular + overtime + mileage + others) − deductions
// (social charges + other deductions).
export const computeTotalPayable = (amounts: PaymentAmounts): number =>
  round2(
    amounts.regularSalary +
      amounts.overtimePay +
      amounts.mileage +
      amounts.others -
      amounts.socialCharges -
      amounts.deductions,
  );

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

// Manual override values (from the boleta editor) — undefined = keep computed.
export type PaymentOverrides = Partial<PaymentAmounts>;

/**
 * Computes the full breakdown for a biweekly period:
 *  - hoursWorked: sum of schedule hours for the employee in the period
 *  - regularSalary: hoursWorked × hourlyRate (0 if no rate is set)
 *  - optional amounts come from overrides (default 0)
 *  - totalPayable: always recomputed from the parts
 */
export const calculateBiweeklyBreakdown = async (
  employeeId: number,
  biweekNumber: number,
  year: number,
  overrides: PaymentOverrides = {},
): Promise<PaymentBreakdown> => {
  if (!Number.isInteger(biweekNumber) || biweekNumber < 1 || biweekNumber > 24) {
    throw new ServiceError(400, "biweekNumber debe estar entre 1 y 24");
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new ServiceError(400, "year debe estar entre 2000 y 2100");
  }

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }

  const hourlyRate = employee.hourlyRate != null ? Number(employee.hourlyRate) : null;

  const { startDate, endDate } = getBiweeklyDates(year, biweekNumber);
  const rows = await loadEmployeeHours(employeeId, startOfDay(startDate), endOfDay(endDate));
  const hoursWorked = round2(sumHours(rows));

  const amounts: PaymentAmounts = {
    regularSalary:
      overrides.regularSalary ?? (hourlyRate !== null ? round2(hoursWorked * hourlyRate) : 0),
    overtimePay: round2(overrides.overtimePay ?? 0),
    mileage: round2(overrides.mileage ?? 0),
    others: round2(overrides.others ?? 0),
    socialCharges: round2(overrides.socialCharges ?? 0),
    deductions: round2(overrides.deductions ?? 0),
  };

  return {
    employeeId,
    biweekNumber,
    year,
    startDate: toISODate(startDate),
    endDate: toISODate(endDate),
    hoursWorked,
    hourlyRate,
    ...amounts,
    totalPayable: computeTotalPayable(amounts),
  };
};
