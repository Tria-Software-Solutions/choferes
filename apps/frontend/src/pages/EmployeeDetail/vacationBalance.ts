import { VacationAccrual } from "../../models/VacationAccrual";

/**
 * Días de vacaciones que se muestran cuando el saldo guardado
 * (`employee.vacationDays`) todavía no está asignado.
 *
 * El saldo guardado manda cuando existe: es el que descuenta al aprobar una
 * solicitud. Si aún no se asignó, se cae al acumulado que reconoce la ley
 * (art. 153) para no mostrar "sin asignar" ni contradecir la métrica
 * "Disponible". Devuelve `null` solo cuando tampoco hay acumulado, es decir
 * cuando falta la fecha de ingreso.
 */
export const displayedVacationDays = (
  storedBalance: number | null | undefined,
  accrual: VacationAccrual | null,
): number | null => {
  if (storedBalance != null) return storedBalance;
  if (accrual) return accrual.availableDays;
  return null;
};
