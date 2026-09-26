import {
  DisciplinaryAction,
  DisciplinaryAttachment,
} from "../models/DisciplinaryAction";
import { PaginatedResult } from "@choferes/shared";
import api, { invalidateCache } from "./api";

export interface DisciplinaryQuery {
  employeeId?: number;
  page?: number;
  limit?: number;
}

export interface DisciplinaryInput {
  actionDate: string;
  type: string;
  severity?: string;
  reason: string;
  description?: string | null;
  attachments?: DisciplinaryAttachment[];
}

export const getDisciplinaryActions = async (
  params: DisciplinaryQuery = {},
): Promise<PaginatedResult<DisciplinaryAction>> => {
  const response = await api.get("/disciplinary-actions", {
    params: { _t: Date.now(), limit: 10000, ...params },
  });
  return response.data;
};

export const getDisciplinaryActionById = async (id: number): Promise<DisciplinaryAction> => {
  const response = await api.get(`/disciplinary-actions/${id}`);
  return response.data;
};

export const createDisciplinaryAction = async (
  employeeId: number,
  input: DisciplinaryInput,
): Promise<DisciplinaryAction> => {
  const response = await api.post("/disciplinary-actions", { employeeId, ...input });
  invalidateCache("/disciplinary-actions");
  return response.data;
};

export const updateDisciplinaryAction = async (
  id: number,
  input: Partial<DisciplinaryInput>,
): Promise<DisciplinaryAction> => {
  const response = await api.put(`/disciplinary-actions/${id}`, input);
  invalidateCache("/disciplinary-actions");
  return response.data;
};

export const deleteDisciplinaryAction = async (id: number): Promise<number> => {
  await api.delete(`/disciplinary-actions/${id}`);
  invalidateCache("/disciplinary-actions");
  return id;
};
