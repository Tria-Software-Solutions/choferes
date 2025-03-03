import { RolePermission } from "../models/RolePermission";
import api from "./api";

export const getRolePermissions = async (roleId: number) => {
  const response = await api.get(`/role-permission/${roleId}`);
  return response.data;
};

export const createRolePermission = async (newRolePermission: Omit<RolePermission, "id">) => {
  const response = await api.post("/role-permission/assign", newRolePermission);
  return response.data;
};

export const deleteRolePermission = async (
  roleId: number,
  permissionId: number
) => {
  await api.delete("/role-permission/remove", {
    data: { roleId, permissionId },
  });
};
