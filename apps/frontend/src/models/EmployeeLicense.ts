/** Frontend EmployeeLicense type — mirrors the backend employee_licenses table */
export type { LicenseType } from "@choferes/shared";
export { LICENSE_TYPES } from "@choferes/shared";

export type LicenseStatus = "vigente" | "por_vencer" | "vencida" | "sin_vencimiento";

export interface LicenseEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  avatar?: string | null;
}

export interface EmployeeLicense {
  id: number;
  employeeId: number;
  licenseType: string;
  licenseNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: LicenseEmployee;
  /** Calculado en el servidor. */
  daysUntilExpiry?: number | null;
  status?: LicenseStatus;
}
