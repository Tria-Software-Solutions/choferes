/**
 * Acumulación de vacaciones según la ley de Costa Rica (art. 153 del Código de
 * Trabajo): 2 semanas remuneradas por cada 50 semanas trabajadas, prorrateado
 * para períodos menores.
 *
 * Unidad usada en toda la app: días hábiles (lun-vie), igual que el conteo de
 * días hábiles de vacaciones. Por eso "2 semanas" = 10 días hábiles.
 *
 * Vive en `@choferes/shared` porque la regla se aplica en dos lugares: el cálculo
 * del backend y el valor que el formulario de alta le propone a la persona que
 * captura. Una sola definición evita que el saldo guardado y el calculado
 * digan cosas distintas.
 */

/** Días hábiles acumulados por cada ciclo completo (2 semanas remuneradas). */
export const VACATION_WORKING_DAYS_PER_CYCLE = 10;
/** Días calendario de un ciclo (50 semanas). */
export const VACATION_CYCLE_DAYS = 350;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parsea YYYY-MM-DD (o un ISO con hora) como fecha de calendario local. */
export const parseVacationDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Fecha de calendario local a YYYY-MM-DD. */
export const toVacationDateOnly = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** Detalle del cálculo, útil para explicarle el saldo a quien lo captura. */
export interface VacationAccrualDetail {
  /** Días hábiles acumulados por antigüedad, prorrateados. */
  accruedDays: number;
  /** Semanas completas trabajadas. */
  weeksWorked: number;
  /** Días calendario entre el ingreso y la fecha de referencia (ambos Inclusive). */
  workedDays: number;
}

/**
 * Días hábiles de vacaciones que la ley otorga por la antigüedad entre
 * `contractStartDate` y `referenceDate`.
 *
 * Sin fecha de ingreso, o si el rango no tiene sentido (referencia anterior al
 * ingreso), no hay acumulación: 0.
 */
export const computeAccruedVacationDays = (
  contractStartDate: string | null | undefined,
  referenceDate: string | Date = new Date(),
): VacationAccrualDetail => {
  const start = parseVacationDate(contractStartDate);
  const end =
    referenceDate instanceof Date
      ? new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
      : parseVacationDate(referenceDate);

  if (!start || !end || end.getTime() < start.getTime()) {
    return { accruedDays: 0, weeksWorked: 0, workedDays: 0 };
  }

  const workedDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  return {
    accruedDays: round2((workedDays / VACATION_CYCLE_DAYS) * VACATION_WORKING_DAYS_PER_CYCLE),
    weeksWorked: Math.floor(workedDays / 7),
    workedDays,
  };
};
