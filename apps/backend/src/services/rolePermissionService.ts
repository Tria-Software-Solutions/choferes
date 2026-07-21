// Service for business logic and database operations related to role-permission assignments
import { RolePermission } from "../models/RolePermission";

// Get all role-permission assignments
export const getRolePermissions = async () => RolePermission.findAll();

// Create a new role-permission assignment
export const createRolePermission = async (data: Omit<RolePermission, "id">) => {
  const newRolePermission = await RolePermission.create(data);
  await newRolePermission.reload();
  return newRolePermission;
};

// Update permissions for a specific role
export const updateRolePermission = async (roleId: number, permissionIds: number[]) => {
  await RolePermission.destroy({ where: { roleId } });
  const newPermissions = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));
  await RolePermission.bulkCreate(newPermissions);
  return RolePermission.findAll({ where: { roleId } });
};

// Delete a role-permission assignment by its ID
export const deleteRolePermission = async (id: number) => RolePermission.destroy({ where: { id } });

// Get all permissions for a specific role
export const getRolePermissionsByRoleId = async (roleId: number) => {
  return RolePermission.findAll({ where: { roleId } });
};
