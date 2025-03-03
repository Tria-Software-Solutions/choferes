import { RolePermission } from "../models/RolePermission";

export const getRolePermissions = async (roleId: number) => {
  return RolePermission.findAll({ where: { roleId } });
};

export const createRolePermission = async (
  data: Omit<RolePermission, "id">
) => {
  return RolePermission.create(data);
};

export const deleteRolePermission = async (id: number) => {
  return RolePermission.destroy({ where: { id } });
};
