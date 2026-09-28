/** Frontend Employee type — mirrors @choferes/shared with avatar support */
import type { EmployeeGender } from "@choferes/shared";
export type {
  TerminationReason,
  EmployeeGender,
} from "@choferes/shared";
export {
  TERMINATION_REASON_LABELS,
  EMPLOYEE_GENDERS,
  EMPLOYEE_POSITIONS,
  EMPLOYEE_POSITION_LABELS,
  getEmployeePositionLabel,
} from "@choferes/shared";

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
  /** Fecha futura en que el sistema desactivará automáticamente al empleado, YYYY-MM-DD. */
  scheduledTerminationDate?: string | null;
  scheduledTerminationReason?: string | null;
  /** Puesto o cargo. */
  position?: string | null;
  /** Género del empleado ("Masculino" | "Femenino"). */
  gender?: EmployeeGender | null;
  /** Cédula de identidad. Solo dígitos: la máscara se aplica en la UI. */
  nationalId?: string | null;
  /** Teléfono principal. Solo dígitos: la máscara se aplica en la UI. */
  primaryPhone?: string | null;
  /** Teléfono secundario (opcional). Solo dígitos. */
  secondaryPhone?: string | null;
  /** Usuario vinculado (para login), si existe. */
  employeeId?: number | null;
  /** Derivado de terminationDate por el servidor. */
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
