/** Frontend Employee type — mirrors @choferes/shared with avatar support */
export type {
  TerminationReason,
} from "@choferes/shared";
export { TERMINATION_REASON_LABELS } from "@choferes/shared";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  /** Hourly rate used to compute the biweekly salary (hours × rate). */
  hourlyRate?: number | null;
  /** Vacation days balance (business days). */
  vacationDays?: number | null;
  /** Fecha de ingreso (inicio de contrato), YYYY-MM-DD. */
  contractStartDate?: string | null;
  /** Fecha de finalización de labores, YYYY-MM-DD. */
  terminationDate?: string | null;
  terminationReason?: string | null;
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
