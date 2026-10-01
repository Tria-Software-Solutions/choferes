// Restricción vehicular ("hoy no circula") de San José, Costa Rica: de lunes a
// viernes, de 6:00 a 19:00, según el último dígito de la placa:
//   lunes 1 y 2 · martes 3 y 4 · miércoles 5 y 6 · jueves 7 y 8 · viernes 9 y 0.
// Es una regla general: no contempla las suspensiones (vacaciones de fin y medio
// año), las exoneraciones por tipo de vehículo ni otros cantones.

/** Día de la semana (0 = domingo … 6 = sábado) restringido por último dígito. */
const RESTRICTED_WEEKDAY_BY_DIGIT: Readonly<Record<string, number>> = {
  "1": 1,
  "2": 1,
  "3": 2,
  "4": 2,
  "5": 3,
  "6": 3,
  "7": 4,
  "8": 4,
  "9": 5,
  "0": 5,
};

export const RESTRICTION_HOURS = { from: "6:00", to: "19:00" } as const;

export const WEEKDAY_NAMES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

/** Placa en mayúscula, sin espacios ni guiones. */
export const normalizePlate = (raw: string): string =>
  raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);

/** Placas válidas: 3 a 10 letras o números, sin repetir (máx. 5). */
export const MAX_PLATES_PER_EMPLOYEE = 5;
export const isValidPlate = (plate: string): boolean => /^[A-Z0-9]{3,10}$/.test(plate);

/** Día en que la placa no puede circular, o null si no termina en dígito. */
export const getRestrictedWeekday = (plate: string): number | null => {
  const last = normalizePlate(plate).slice(-1);
  return last in RESTRICTED_WEEKDAY_BY_DIGIT ? RESTRICTED_WEEKDAY_BY_DIGIT[last] : null;
};

export interface PlateRestriction {
  plate: string;
  /** Último carácter, el que decide el día. */
  lastDigit: string | null;
  /** Día restringido (nombre) o null si no se pudo determinar. */
  dayName: string | null;
  weekday: number | null;
  /** ¿Hoy es su día de restricción? (solo cuenta de lunes a viernes). */
  restrictedOn: boolean;
}

export const getPlateRestriction = (plate: string, date: Date = new Date()): PlateRestriction => {
  const normalized = normalizePlate(plate);
  const weekday = getRestrictedWeekday(normalized);
  return {
    plate: normalized,
    lastDigit: weekday === null ? null : normalized.slice(-1),
    dayName: weekday === null ? null : WEEKDAY_NAMES[weekday],
    weekday,
    restrictedOn: weekday !== null && date.getDay() === weekday,
  };
};

/** Formato de la placa para mostrar: ABC123 → ABC-123 (las numéricas, tal cual). */
export const formatPlate = (plate: string): string => {
  const normalized = normalizePlate(plate);
  const match = normalized.match(/^([A-Z]{2,3})(\d{1,6})$/);
  return match ? `${match[1]}-${match[2]}` : normalized;
};
