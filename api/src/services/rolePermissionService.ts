import { RolePermission } from "../models/RolePermission";

export const getRolePermissions = async () => {
  return RolePermission.findAll();
};

export const createRolePermission = async (
  data: Omit<RolePermission, "id">
) => {
  return RolePermission.create(data);
};

export const deleteRolePermission = async (id: number) => {
  return RolePermission.destroy({ where: { id } });
};
