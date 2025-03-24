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
  roleId: number,
  permissionIds: number[]
) => {
  await RolePermission.destroy({ where: { roleId } });
  const newPermissions = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));
  await RolePermission.bulkCreate(newPermissions);
  return await RolePermission.findAll({ where: { roleId } });
};

export const deleteRolePermission = async (id: number) => {
  return RolePermission.destroy({ where: { id } });
};
