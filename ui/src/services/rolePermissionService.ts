import api from "./api";

export const assignRolePermission = async (roleId: number, permissionId: number) => {
  const response = await api.post("/role-permission/assign", {
    roleId,
    permissionId,
  });
  return response.data;
};

export const fetchRolePermissions = async (roleId: number) => {
  const response = await api.get(`/role-permission/${roleId}`);
  return response.data;
};

export const removeRolePermission = async (
  roleId: number,
  permissionId: number
) => {
  const response = await api.delete("/role-permission/remove", {
    data: { roleId, permissionId },
  });
  return response.data;
};
