import api, { invalidateCache } from "./api";
import type { LicenseRequest, LicenseRequestStatus } from "../models/LicenseRequest";

// Revisión de las solicitudes que envían los empleados desde su expediente.
// Aprobar aplica el cambio a la licencia real; rechazar solo la cierra.

export const getLicenseRequests = async (params: {
  employeeId?: number;
  status?: LicenseRequestStatus;
} = {}): Promise<LicenseRequest[]> => {
  const response = await api.get("/license-requests", { params });
  return response.data.data ?? [];
};

export const approveLicenseRequest = async (id: number): Promise<LicenseRequest> => {
  const response = await api.post(`/license-requests/${id}/approve`);
  invalidateCache("/employee-licenses");
  invalidateCache("/license-requests");
  invalidateCache("/me/overview");
  return response.data;
};

export const rejectLicenseRequest = async (
  id: number,
  reviewNotes?: string | null,
): Promise<LicenseRequest> => {
  const response = await api.post(`/license-requests/${id}/reject`, {
    reviewNotes: reviewNotes ?? null,
  });
  invalidateCache("/license-requests");
  invalidateCache("/me/overview");
  return response.data;
};
