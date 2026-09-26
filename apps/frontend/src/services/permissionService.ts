import { Permission } from "../models/Permission";
import api from "./api";

// The permission catalog is code-owned, so the API is read-only.

export const getPermissions = async (search?: string) => {
  const params: Record<string, string | number> = {
    _t: Date.now(),
  };
  if (search) params.search = search;

  const response = await api.get("/permissions", { params });
  return response.data.data;
};

export const getPermissionById = async (id: number) => {
  const response = await api.get(`/permissions/${id}`);
  return response.data;
};

export const getPermissionsByNames = async (names: string[]) => {
  const response = await api.get(`/permissions/names/${names}`);
  return response.data;
};

export type { Permission };
