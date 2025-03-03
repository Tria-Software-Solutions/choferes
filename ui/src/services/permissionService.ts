import { Permission } from "../models/Permission";
import api from "./api";

export const getPermissions = async () => {
  const response = await api.get("/permissions");
  return response.data;
};

export const getPermissionById = async (id: number) => {
  const response = await api.get(`/permissions/${id}`);
  return response.data;
};

export const createPermission = async (newPermission: Omit<Permission, "id">) => {
  const response = await api.post("/permissions", newPermission);
  return response.data;
};

export const deletePermission = async (id: number) => {
  await api.delete(`/permissions/${id}`);
};