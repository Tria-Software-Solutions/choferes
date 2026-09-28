/**
 * Horas de la quincena por empleado, para la tabla de Planilla.
 *
 * La fuente de verdad es `hours_worked` (igual que el pago): cada registro aporta
 * las horas del día según el turno del empleado. Las horas extra se derivan con
 * la MISMA regla que el comprobante (`getPayrollRules().regularHoursPerBiweek`),
 * de modo que el número de la tabla nunca discrepa del boleto.
 *
 * El reparto de horas por día se delega en `sumHours`, que es el mismo helper que
 * usa el cálculo de pago: si algún día cambia la regla, cambia en los dos lados.
 */
import HoursWorked from "../models/HoursWorked";
import Schedule from "../models/Schedule";
import ScheduleDay from "../models/ScheduleDay";
import {
  getBiweekNumber,
  getBiweeklyDates,
  startOfDay,
  endOfDay,
  sumHours,
  type HoursRow,
} from "./summaryRecalculationService";
import { getPayrollRules, round2 } from "./paymentCalculationService";

export type EmployeeBiweeklyHours = {
  employeeId: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
};

/** Quincena que contiene hoy (24 quincenas al año, dos por mes). */
export const getCurrentBiweek = (
  now: Date = new Date(),
): { biweekNumber: number; year: number } => ({
  biweekNumber: getBiweekNumber(now),
  year: now.getFullYear(),
});

/**
 * Una sola consulta para toda la quincena y un groupBy en memoria: pedir fila por
 * fila con `getBiweeklyHours` sería N+1 sobre la tabla más pesada del sistema.
 */
export const getEmployeesBiweeklyHours = async (
  biweekNumber: number,
  year: number,
): Promise<EmployeeBiweeklyHours[]> => {
  const { startDate, endDate } = getBiweeklyDates(year, biweekNumber);
  const rows = await HoursWorked.findAll({
    where: { date: { $between: [startOfDay(startDate), endOfDay(endDate)] } },
    include: [
      {
        model: Schedule,
        include: [{ model: ScheduleDay, as: "scheduleDays" }],
      },
    ],
  });

  const byEmployee = new Map<number, HoursRow[]>();
  rows.forEach((row) => {
    const plain = row.get({ plain: true });
    // Sequelize anida la belongsTo como "Schedule" (alias por defecto); se
    // normaliza igual que hace `toHoursRow` en summaryRecalculationService.
    const hoursRow: HoursRow = {
      date: plain.date,
      employeeId: plain.employeeId,
      schedule: plain.Schedule ?? plain.schedule ?? null,
    };
    const list = byEmployee.get(hoursRow.employeeId as number) ?? [];
    list.push(hoursRow);
    byEmployee.set(hoursRow.employeeId as number, list);
  });

  const { regularHoursPerBiweek } = getPayrollRules();
  return Array.from(byEmployee, ([employeeId, hoursRows]) => {
    const totalHours = round2(sumHours(hoursRows));
    return {
      employeeId,
      totalHours,
      regularHours: round2(Math.min(totalHours, regularHoursPerBiweek)),
      overtimeHours: round2(Math.max(0, totalHours - regularHoursPerBiweek)),
    };
  });
};
