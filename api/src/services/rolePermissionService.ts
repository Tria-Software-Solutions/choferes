import { RolePermission } from "../models/RolePermission";

export const getRolePermissions = async () => RolePermission.findAll();

export const createRolePermission = async (data: Omit<RolePermission, "id">) => {
  const newRolePermission = await RolePermission.create(data);
  await newRolePermission.reload();
  return newRolePermission;
};

export const updateRolePermission = async (roleId: number, permissionIds: number[]) => {
  await RolePermission.destroy({ where: { roleId } });
  const newPermissions = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));
  await RolePermission.bulkCreate(newPermissions);
  return RolePermission.findAll({ where: { roleId } });
};

export const deleteRolePermission = async (id: number) => RolePermission.destroy({ where: { id } });
