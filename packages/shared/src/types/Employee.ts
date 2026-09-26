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
  /** Puesto o cargo. */
  position?: string | null;
  /** Cédula de identidad. */
  nationalId?: string | null;
  /** Derivado de terminationDate por el servidor. */
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
