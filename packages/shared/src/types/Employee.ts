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

// Género de un empleado. Controla la variante de algunos puestos (Cajero/Cajera…).
export type EmployeeGender = "Masculino" | "Femenino";

export const EMPLOYEE_GENDERS: readonly EmployeeGender[] = [
  "Masculino",
  "Femenino",
];

// Puestos válidos de un empleado. Se guardan en su forma base (sin género).
// "polivalente" abarca varios roles (cubre todo y no cambia con el género).
export type EmployeePosition = "chofer" | "cajero" | "supervisor" | "polivalente";

export const EMPLOYEE_POSITIONS: readonly EmployeePosition[] = [
  "chofer",
  "cajero",
  "supervisor",
  "polivalente",
];

export const EMPLOYEE_POSITION_LABELS: Record<EmployeePosition, string> = {
  chofer: "Chofer",
  cajero: "Cajero",
  supervisor: "Supervisor",
  polivalente: "Polivalente",
};

// Etiqueta de un puesto. "Cajero" pasa a "Cajera" y "Supervisor" a
// "Supervisora" cuando el género del empleado es femenino. Los puestos
// legados (texto libre) se muestran tal cual.
export const getEmployeePositionLabel = (
  position: string | null | undefined,
  gender: EmployeeGender | null | undefined,
): string | null => {
  if (!position) return null;
  const base = EMPLOYEE_POSITION_LABELS[position as EmployeePosition];
  if (!base) return position;
  if (gender === "Femenino") {
    if (position === "cajero") return "Cajera";
    if (position === "supervisor") return "Supervisora";
  }
  return base;
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
  /** Género del empleado ("Masculino" | "Femenino"). */
  gender?: EmployeeGender | null;
  /** Cédula de identidad. Solo dígitos: la máscara se aplica en la UI. */
  nationalId?: string | null;
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
