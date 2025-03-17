import { RolePermission } from "../models/RolePermission";

export const getRolePermissions = async () => {
  return RolePermission.findAll();
};

export const createRolePermission = async (
  data: Omit<RolePermission, "id">
) => {
  const newRolePermission = await RolePermission.create(data);
  await newRolePermission.reload();
  return newRolePermission;
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
