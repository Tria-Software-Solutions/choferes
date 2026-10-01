// Motivos de finalización de labores (despido o renuncia) en Costa Rica.
// El empleado pasa a inactivo cuando se registra una fecha de finalización.
export type TerminationReason =
  | "renuncia"
  | "despido"
  | "mutuo_acuerdo"
  | "fin_contrato"
  | "jubilacion"
  | "fallecimiento"
  | "otro";

export const EMPLOYEE_TERMINATION_REASONS: readonly TerminationReason[] = [
  "renuncia",
  "despido",
  "mutuo_acuerdo",
  "fin_contrato",
  "jubilacion",
  "fallecimiento",
  "otro",
];

export const TERMINATION_REASON_LABELS: Record<TerminationReason, string> = {
  renuncia: "Renuncia",
  despido: "Despido",
  mutuo_acuerdo: "Mutuo acuerdo",
  fin_contrato: "Fin de contrato",
  jubilacion: "Jubilación",
  fallecimiento: "Fallecimiento",
  otro: "Otro",
};

// Género de un empleado. Controla la variante de algunos puestos (Supervisora,
// Chofer coordinadora…).
export type EmployeeGender = "Masculino" | "Femenino";

export const EMPLOYEE_GENDERS: readonly EmployeeGender[] = [
  "Masculino",
  "Femenino",
];

// Puestos válidos de un empleado (y los únicos que existen). Se guardan en su
// forma base, sin género. Cada puesto tiene un rol de acceso con el mismo
// nombre (ver `POSITION_ROLE_NAMES`): un supervisor siempre tiene el rol
// Supervisor. El orden va de menor a mayor privilegio y es el que muestra el
// selector de puesto.
import type { NationalIdType } from "./EmployeeIdentity";

export type EmployeePosition =
  | "chofer"
  | "chofer_coordinador"
  | "recepcionista"
  | "supervisor"
  | "administrativo"
  | "gerencia";

export const EMPLOYEE_POSITIONS: readonly EmployeePosition[] = [
  "chofer",
  "chofer_coordinador",
  "recepcionista",
  "supervisor",
  "administrativo",
  "gerencia",
];

export const EMPLOYEE_POSITION_LABELS: Record<EmployeePosition, string> = {
  chofer: "Chofer",
  chofer_coordinador: "Chofer coordinador",
  recepcionista: "Recepcionista",
  supervisor: "Supervisor",
  administrativo: "Administrativo",
  gerencia: "Gerencia",
};

// Valores fuera del catálogo (datos anteriores) nunca se muestran con guiones
// bajos: "chofer_coordinador" -> "Chofer coordinador".
const humanizeKey = (value: string): string => {
  const spaced = value.replace(/_/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

// Etiqueta de un puesto. "Supervisor" pasa a "Supervisora", "Chofer
// coordinador" a "Chofer coordinadora" y "Administrativo" a "Administrativa"
// cuando el género del empleado es femenino. "Gerencia" nombra un área, no una
// persona, así que no cambia. Valores desconocidos (datos anteriores a esta
// lista) se muestran tal cual.
export const getEmployeePositionLabel = (
  position: string | null | undefined,
  gender: EmployeeGender | null | undefined,
): string | null => {
  if (!position) return null;
  const base = EMPLOYEE_POSITION_LABELS[position as EmployeePosition];
  if (!base) return humanizeKey(position);
  if (gender === "Femenino") {
    if (position === "supervisor") return "Supervisora";
    if (position === "chofer_coordinador") return "Chofer coordinadora";
    if (position === "administrativo") return "Administrativa";
  }
  return base;
};

/**
 * Puestos de un empleado. `positions` es la lista completa (un empleado puede
 * tener varios); `position` es el principal (el primero) y se conserva para el
 * código que solo conoce uno. Siempre devuelve al menos los puestos válidos
 * conocidos, sin duplicados y en el orden en que se guardaron.
 */
export const getEmployeePositions = (employee: {
  positions?: readonly string[] | null;
  position?: string | null;
}): string[] => {
  const list =
    employee.positions && employee.positions.length > 0
      ? [...employee.positions]
      : employee.position
        ? [employee.position]
        : [];
  return Array.from(new Set(list.filter(Boolean)));
};

/** "Chofer, Supervisor": todos los puestos con su etiqueta, separados por coma. */
export const getEmployeePositionsLabel = (
  employee: { positions?: readonly string[] | null; position?: string | null },
  gender: EmployeeGender | null | undefined,
): string | null => {
  const labels = getEmployeePositions(employee)
    .map((position) => getEmployeePositionLabel(position, gender))
    .filter((label): label is string => Boolean(label));
  return labels.length > 0 ? labels.join(", ") : null;
};

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  hourlyRate?: number | null;
  vacationDays?: number | null;
  /** Fecha de ingreso (inicio de contrato), YYYY-MM-DD. */
  contractStartDate?: string | null;
  /** Fecha de finalización de labores, YYYY-MM-DD. */
  terminationDate?: string | null;
  terminationReason?: TerminationReason | null;
  terminationNotes?: string | null;
  /** Puesto o cargo (base: chofer | cajero | supervisor, o legado como texto libre). */
  position?: string | null;
  /** Todos los puestos del empleado (el primero es `position`). */
  positions?: string[] | null;
  /** Género del empleado ("Masculino" | "Femenino"). */
  gender?: EmployeeGender | null;
  /**
   * Documento de identidad. Cédula y DIMEX: solo dígitos (la máscara se aplica en
   * la UI); pasaporte y otros: letras y números en mayúscula.
   */
  nationalId?: string | null;
  /** Tipo del documento: cédula (por defecto), DIMEX, pasaporte u otro. */
  nationalIdType?: NationalIdType;
  /** Nacionalidad (ISO 3166-1 alfa-2). La bandera sale de aquí. */
  nationality?: string | null;
  /** Fecha de nacimiento, YYYY-MM-DD. */
  birthDate?: string | null;
  /** Dirección de residencia. */
  address?: string | null;
  /** Placas de los vehículos propios del empleado (para la restricción vehicular). */
  vehiclePlates?: string[] | null;
  /** Teléfono principal. Solo dígitos: la máscara se aplica en la UI. */
  primaryPhone?: string | null;
  /** Teléfono secundario (opcional). Solo dígitos. */
  secondaryPhone?: string | null;
  /** Horario asignado al empleado (FK → schedule.id). */
  scheduleId?: number | null;
  /** Derivado de terminationDate por el servidor. */
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
