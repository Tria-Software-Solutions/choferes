import { RolePermission } from "../models/RolePermission";
import api, { invalidateCache } from "./api";

export const getRolePermissions = async () => {
  const response = await api.get("/role-permissions", {
    params: {
      _t: Date.now()
    }
  });
  return response.data;
};

export const getRolePermissionsByRoleId = async (roleId: number) => {
  const response = await api.get(`/role-permission/role/${roleId}`);
  return response.data;
};

export const createRolePermission = async (
  newRolePermission: Omit<RolePermission, "id">,
) => {
  const response = await api.post("/role-permissions", newRolePermission);
  invalidateCache("/role-permissions");
  return response.data;
};

export const updateRolePermission = async (
  roleId: number,
  permissionIds: number[],
) => {
  const response = await api.put(`/role-permission/${roleId}`, {
    permissionIds,
  });
  invalidateCache("/role-permissions");
  return response.data;
};

export const deleteRolePermission = async (id: number) => {
  const response = await api.delete(`/role-permissions/${id}`);
  invalidateCache("/role-permissions");
  return { id, message: response.data };
};
