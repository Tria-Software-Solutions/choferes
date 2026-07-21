import { Permission } from "../models/Permission";
import api, { invalidateCache } from "./api";

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

export const createPermission = async (
  newPermission: Omit<Permission, "id">,
) => {
  const response = await api.post("/permissions", newPermission);
  invalidateCache("/permissions");
  return response.data;
};

export const updatePermission = async (
  id: number,
  updatedPermission: Partial<Permission>,
) => {
  const response = await api.put(`/permissions/${id}`, updatedPermission);
  invalidateCache("/permissions");
  return response.data;
};

export const deletePermission = async (id: number) => {
  const response = await api.delete(`/permissions/${id}`);
  invalidateCache("/permissions");
  return { id, message: response.data };
};
