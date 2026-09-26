import { EmployeeLicense } from "../models/EmployeeLicense";
import { PaginatedResult } from "@choferes/shared";
import api, { invalidateCache } from "./api";

export interface LicenseQuery {
  employeeId?: number;
  page?: number;
  limit?: number;
}

export const getLicenses = async (
  params: LicenseQuery = {},
): Promise<PaginatedResult<EmployeeLicense>> => {
  const response = await api.get("/employee-licenses", {
    params: { _t: Date.now(), limit: 10000, ...params },
  });
  return response.data;
};

export const getLicenseById = async (id: number): Promise<EmployeeLicense> => {
  const response = await api.get(`/employee-licenses/${id}`);
  return response.data;
};

export const createLicense = async (input: {
  employeeId: number;
  licenseType: string;
  licenseNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
}): Promise<EmployeeLicense> => {
  const response = await api.post("/employee-licenses", input);
  invalidateCache("/employee-licenses");
  return response.data;
};

export const updateLicense = async (
  id: number,
  input: {
    licenseType?: string;
    licenseNumber?: string | null;
    issuedAt?: string | null;
    expiresAt?: string | null;
    notes?: string | null;
  },
): Promise<EmployeeLicense> => {
  const response = await api.put(`/employee-licenses/${id}`, input);
  invalidateCache("/employee-licenses");
  return response.data;
};

export const deleteLicense = async (id: number): Promise<number> => {
  await api.delete(`/employee-licenses/${id}`);
  invalidateCache("/employee-licenses");
  return id;
};
