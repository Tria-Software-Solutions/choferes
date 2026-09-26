import { Vacation } from "../models/Vacation";
import api, { invalidateCache } from "./api";
import { PaginatedResult } from "@choferes/shared";

export interface VacationQuery {
  employeeId?: number;
  status?: string;
  page?: number;
  limit?: number;
}

// Paginated list of vacation requests (employee + approver identity).
export const getVacations = async (
  params: VacationQuery = {},
): Promise<PaginatedResult<Vacation>> => {
  const response = await api.get("/vacations", {
    params: { _t: Date.now(), limit: 10000, ...params },
  });
  return response.data;
};

export const getVacationById = async (id: number): Promise<Vacation> => {
  const response = await api.get(`/vacations/${id}`);
  return response.data;
};

// Creates a pending request (business days are computed server-side).
export const createVacation = async (input: {
  employeeId: number;
  startDate: string;
  endDate: string;
  reason?: string | null;
}): Promise<Vacation> => {
  const response = await api.post("/vacations", input);
  invalidateCache("/vacations");
  return response.data;
};

// Partial edit; status=approved deducts the balance, rejected restores nothing.
export const updateVacation = async (
  id: number,
  input: {
    startDate?: string;
    endDate?: string;
    reason?: string | null;
    status?: "pending" | "approved" | "rejected";
  },
): Promise<Vacation> => {
  const response = await api.put(`/vacations/${id}`, input);
  invalidateCache("/vacations");
  invalidateCache("/employees");
  return response.data;
};

// Deletes a vacation request (an approved one restores the balance).
export const deleteVacation = async (id: number): Promise<number> => {
  await api.delete(`/vacations/${id}`);
  invalidateCache("/vacations");
  invalidateCache("/employees");
  return id;
};
