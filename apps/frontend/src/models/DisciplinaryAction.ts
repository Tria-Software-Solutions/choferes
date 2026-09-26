/** Frontend DisciplinaryAction type — mirrors the backend disciplinary_actions table */
import type { DisciplinaryAttachment } from "@choferes/shared";

export type { DisciplinaryActionType, DisciplinarySeverity, DisciplinaryAttachment } from "@choferes/shared";
export {
  DISCIPLINARY_ACTION_TYPES,
  DISCIPLINARY_ACTION_TYPE_LABELS,
  DISCIPLINARY_SEVERITIES,
  DISCIPLINARY_SEVERITY_LABELS,
} from "@choferes/shared";

export interface DisciplinaryEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  avatar?: string | null;
}

export interface DisciplinaryAction {
  id: number;
  employeeId: number;
  actionDate: string;
  type: string;
  severity: string;
  reason: string;
  description?: string | null;
  attachments?: DisciplinaryAttachment[] | null;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: DisciplinaryEmployee;
  createdByUser?: { id: number; firstName: string; lastName: string } | null;
}
