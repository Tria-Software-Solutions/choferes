import { MyPanelOverview } from "../models/MyPanel";
import { Vacation } from "../models/Vacation";
import { Employee } from "../models/Employee";
import { LicenseRequest } from "../models/LicenseRequest";
import api, { invalidateCache } from "./api";

// Panel personal. Todo se resuelve en el servidor a partir de la sesión
// (users.employeeId), así que no se envían ids de empleado desde el cliente.
export const getMyOverview = async (): Promise<MyPanelOverview> => {
  const response = await api.get("/me/overview", { params: { _t: Date.now() } });
  return response.data;
};

// Solicitud de vacaciones del propio empleado (queda pendiente de aprobación).
export const createMyVacation = async (input: {
  startDate: string;
  endDate: string;
  reason?: string | null;
}): Promise<Vacation> => {
  const response = await api.post("/me/vacations", input);
  invalidateCache("/vacations");
  invalidateCache("/me/overview");
  return response.data;
};

/**
 * Guarda los datos propios del empleado (teléfonos, correo, dirección,
 * documento, vehículos…). El servidor filtra por lista blanca: puesto,
 * contrato y compensación no se pueden cambiar por esta vía.
 */
export const updateMyProfile = async (input: Record<string, unknown>): Promise<Employee> => {
  const response = await api.put("/me/profile", input);
  invalidateCache("/me/overview");
  invalidateCache("/employees");
  return response.data;
};

/** Pide crear o editar una licencia propia. Queda pendiente de revisión. */
export const createMyLicenseRequest = async (input: {
  action: "create" | "update" | "delete";
  licenseId?: number | null;
  licenseType?: string;
  licenseNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}): Promise<LicenseRequest> => {
  const response = await api.post("/me/licenses/requests", input);
  invalidateCache("/me/overview");
  invalidateCache("/license-requests");
  return response.data;
};

/** Solicitudes de licencia propias, para mostrar en qué quedaron. */
export const getMyLicenseRequests = async (): Promise<LicenseRequest[]> => {
  const response = await api.get("/me/licenses/requests", { params: { _t: Date.now() } });
  return response.data.data ?? [];
};
