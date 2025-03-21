import { RolePermission } from "../models/RolePermission";
import api from "./api";

export const getRolePermissions = async () => {
  const response = await api.get(`/role-permission`);
  return response.data;
};

export const createRolePermission = async (
  newRolePermission: Omit<RolePermission, "id">
) => {
  const response = await api.post("/role-permission", newRolePermission);
  return response.data;
};

export const updateRolePermission = async (
  roleId: number,
  permissionIds: number[]
) => {
  await api.put(`/role-permission/${roleId}`, { permissionIds });
};

export const deleteRolePermission = async (id: number) => {
  await api.delete(`/role-permission/${id}`);
};
