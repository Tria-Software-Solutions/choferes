import { RolePermission } from "../models/RolePermission";

export const getRolePermissions = async () => {
  return RolePermission.findAll();
};

export const createRolePermission = async (
  data: Omit<RolePermission, "id">
) => {
  return RolePermission.create(data);
};

export const updateRolePermission = async (
  id: number,
  data: Omit<RolePermission, "id">
) => {
  await RolePermission.update(data, { where: { id } });
  return RolePermission.findByPk(id);
};

export const deleteRolePermission = async (id: number) => {
  return RolePermission.destroy({ where: { id } });
};
