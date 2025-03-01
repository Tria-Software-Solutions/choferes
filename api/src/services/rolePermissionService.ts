import { RolePermission } from "../models/RolePermission";

export const assignPermissionToRole = async (
  data: Omit<RolePermission, "id">
) => {
  return RolePermission.create(data);
};

export const getPermissionsByRole = async (roleId: number) => {
  return RolePermission.findAll({ where: { roleId } });
};

export const removePermissionFromRole = async (
  roleId: number,
  permissionId: number
) => {
  return RolePermission.destroy({ where: { roleId, permissionId } });
};
