/** Acumulación de vacaciones según la ley de Costa Rica (art. 153, prorrateado). */
export interface VacationAccrual {
  contractStartDate: string | null;
  referenceDate: string;
  /** Días hábiles acumulados por antigüedad. */
  accruedDays: number;
  /** Días hábiles ya gozados (vacaciones aprobadas). */
  takenDays: number;
  /** Acumulado pendiente de gozar. */
  availableDays: number;
  weeksWorked: number;
  /** Saldo manual guardado en el empleado. */
  currentBalance: number | null;
}
