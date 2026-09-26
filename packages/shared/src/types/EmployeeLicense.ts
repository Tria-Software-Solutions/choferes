// Licencias de conducir de Costa Rica (categorías del COSEVI).
export type LicenseType =
  | "A1"
  | "A2"
  | "A3"
  | "B1"
  | "B2"
  | "B3"
  | "C1"
  | "C2"
  | "C3"
  | "D1"
  | "D2"
  | "D3"
  | "E";

export const LICENSE_TYPES: readonly LicenseType[] = [
  "A1",
  "A2",
  "A3",
  "B1",
  "B2",
  "B3",
  "C1",
  "C2",
  "C3",
  "D1",
  "D2",
  "D3",
  "E",
];

export interface EmployeeLicense {
  id: number;
  employeeId: number;
  licenseType: LicenseType;
  licenseNumber?: string | null;
  /** Fecha de expedición, YYYY-MM-DD. */
  issuedAt?: string | null;
  /** Fecha de vencimiento, YYYY-MM-DD. */
  expiresAt?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
