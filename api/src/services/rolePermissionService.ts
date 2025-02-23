import { RolePermission } from "../models/RolePermission";

export const assignPermissionToRole = async (
  roleId: number,
  permissionId: number
) => {
  return RolePermission.create({ roleId, permissionId });
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
