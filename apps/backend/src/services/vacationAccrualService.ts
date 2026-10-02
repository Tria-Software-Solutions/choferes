// Acumulación de vacaciones según la ley de Costa Rica (art. 153 del Código de
// Trabajo). La regla (2 semanas remuneradas por cada 50 semanas trabajadas,
// prorrateada) vive en `@choferes/shared` para que el backend y el formulario de
// alta no calculen cosas distintas.
import {
  computeAccruedVacationDays,
  parseVacationDate,
  toVacationDateOnly,
  VACATION_CYCLE_DAYS,
  VACATION_WORKING_DAYS_PER_CYCLE,
} from "@choferes/shared";
import Employee from "../models/Employee";
import Vacation from "../models/Vacation";
import { ServiceError } from "../utils/errors";

export { VACATION_CYCLE_DAYS, VACATION_WORKING_DAYS_PER_CYCLE };

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
  /** Saldo manual guardado en el empleado (ajuste o valor capturado a mano). */
  currentBalance: number | null;
}

// Computes the accrual for an employee from their contract start date up to
// their termination date (or today when still active).
export const computeVacationAccrual = async (
  employee: Employee,
  today: Date = new Date(),
): Promise<VacationAccrual> => {
  const reference = new Date(today);
  reference.setHours(0, 0, 0, 0);

  const start = employee.contractStartDate
    ? parseVacationDate(String(employee.contractStartDate))
    : null;

  const termination = employee.terminationDate
    ? parseVacationDate(String(employee.terminationDate))
    : null;

  const end = termination && termination.getTime() < reference.getTime() ? termination : reference;

  const approved = await Vacation.findAll({
    where: { employeeId: employee.id, status: "approved" },
    attributes: ["daysRequested"],
  });
  const takenDays = approved.reduce((total, row) => total + Number(row.daysRequested || 0), 0);

  const currentBalance = employee.vacationDays != null ? Number(employee.vacationDays) : null;

  const detail = computeAccruedVacationDays(start ? toVacationDateOnly(start) : null, end);

  if (!start) {
    return {
      contractStartDate: null,
      referenceDate: toVacationDateOnly(end),
      accruedDays: 0,
      takenDays,
      availableDays: takenDays > 0 ? -takenDays : 0,
      weeksWorked: 0,
      currentBalance,
    };
  }

  const availableDays = Math.round((detail.accruedDays - takenDays) * 100) / 100;

  return {
    contractStartDate: toVacationDateOnly(start),
    referenceDate: toVacationDateOnly(end),
    accruedDays: detail.accruedDays,
    takenDays,
    availableDays,
    weeksWorked: detail.weeksWorked,
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
