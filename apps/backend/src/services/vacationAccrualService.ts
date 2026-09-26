// Acumulación de vacaciones según la ley de Costa Rica (art. 153 del Código de
// Trabajo): 2 semanas remuneradas por cada 50 semanas trabajadas, prorrateado
// para períodos menores.
//
// Unidad usada en toda la app: días hábiles (lun-vie), igual que
// `countBusinessDays` de vacationService. Por eso "2 semanas" = 10 días hábiles.
import Employee from "../models/Employee";
import Vacation from "../models/Vacation";
import { ServiceError } from "../utils/errors";

export const VACATION_WORKING_DAYS_PER_CYCLE = 10; // 2 semanas (lun-vie)
export const VACATION_CYCLE_DAYS = 350; // 50 semanas
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface VacationAccrual {
  contractStartDate: string | null;
  referenceDate: string;
  /** Días hábiles acumulados por antigüedad (prorrateado). */
  accruedDays: number;
  /** Días hábiles ya gozados (vacaciones aprobadas). */
  takenDays: number;
  /** Acumulado pendiente de gozar (accrued − taken). */
  availableDays: number;
  /** Semanas completas trabajadas (informativo). */
  weeksWorked: number;
  /** Saldo manual guardado en el empleado (legacy). */
  currentBalance: number | null;
}

// Parses a YYYY-MM-DD (or ISO datetime) as a local calendar date.
const parseDateOnly = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const toIsoDateOnly = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

// Computes the accrual for an employee from their contract start date up to
// their termination date (or today when still active).
export const computeVacationAccrual = async (
  employee: Employee,
  today: Date = new Date(),
): Promise<VacationAccrual> => {
  const reference = new Date(today);
  reference.setHours(0, 0, 0, 0);

  const start = employee.contractStartDate
    ? parseDateOnly(String(employee.contractStartDate))
    : null;

  const termination = employee.terminationDate
    ? parseDateOnly(String(employee.terminationDate))
    : null;

  const end = termination && termination.getTime() < reference.getTime() ? termination : reference;

  const approved = await Vacation.findAll({
    where: { employeeId: employee.id, status: "approved" },
    attributes: ["daysRequested"],
  });
  const takenDays = approved.reduce((total, row) => total + Number(row.daysRequested || 0), 0);

  const currentBalance = employee.vacationDays != null ? Number(employee.vacationDays) : null;

  if (!start || Number.isNaN(start.getTime()) || end.getTime() < start.getTime()) {
    return {
      contractStartDate: start ? toIsoDateOnly(start) : null,
      referenceDate: toIsoDateOnly(end),
      accruedDays: 0,
      takenDays,
      availableDays: takenDays > 0 ? -takenDays : 0,
      weeksWorked: 0,
      currentBalance,
    };
  }

  const workedDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const accruedDays = (workedDays / VACATION_CYCLE_DAYS) * VACATION_WORKING_DAYS_PER_CYCLE;
  const roundedAccrued = Math.round(accruedDays * 100) / 100;
  const availableDays = Math.round((roundedAccrued - takenDays) * 100) / 100;

  return {
    contractStartDate: toIsoDateOnly(start),
    referenceDate: toIsoDateOnly(end),
    accruedDays: roundedAccrued,
    takenDays,
    availableDays,
    weeksWorked: Math.floor(workedDays / 7),
    currentBalance,
  };
};

// Loads the employee (404 when unknown) and computes their accrual.
export const getVacationAccrual = async (employeeId: number): Promise<VacationAccrual> => {
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new ServiceError(404, "Empleado no encontrado");
  }
  return computeVacationAccrual(employee);
};
