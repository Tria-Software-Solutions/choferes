import type { EmployeeLicense } from "./EmployeeLicense";

/**
 * Cambio de licencia propuesto por el propio empleado. Queda `pending` hasta
 * que Gerencia/Administrativo lo aprueba (aplica el cambio) o lo rechaza.
 */
export type LicenseRequestAction = "create" | "update" | "delete";
export type LicenseRequestStatus = "pending" | "approved" | "rejected";

export interface LicenseRequestPayload {
  licenseType?: string;
  licenseNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}

export interface LicenseRequestEmployee {
  id: number;
  firstName: string;
  lastName: string;
}

export interface LicenseRequest {
  id: number;
  employeeId: number;
  /** null cuando la solicitud es crear una licencia nueva. */
  licenseId?: number | null;
  action: LicenseRequestAction;
  payload?: LicenseRequestPayload | null;
  status: LicenseRequestStatus;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: LicenseRequestEmployee;
  license?: EmployeeLicense | null;
}

export const LICENSE_REQUEST_ACTION_LABELS: Record<LicenseRequestAction, string> = {
  create: "Nueva licencia",
  update: "Cambio de licencia",
  delete: "Eliminar licencia",
};

export const LICENSE_REQUEST_STATUS_LABELS: Record<LicenseRequestStatus, string> = {
  pending: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
};
