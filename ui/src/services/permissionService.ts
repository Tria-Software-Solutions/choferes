import { Permission } from "../models/Permission";
import api, { invalidateCache } from "./api";

export const getPermissions = async () => {
  const response = await api.get("/permissions", {
    params: {
      _t: Date.now()
    }
  });
  return response.data;
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
