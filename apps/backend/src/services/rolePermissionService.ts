// Service for business logic and database operations related to role-permission assignments
import sequelize from "../config/database";
import { RolePermission } from "../models/RolePermission";

// Get all role-permission assignments
export const getRolePermissions = async () => RolePermission.findAll();

// Create a new role-permission assignment
export const createRolePermission = async (data: Omit<RolePermission, "id">) => {
  const newRolePermission = await RolePermission.create(data);
  await newRolePermission.reload();
  return newRolePermission;
};

// Replaces the permission set of a role atomically: if inserting the new set
// fails, the role keeps its previous permissions instead of ending up with none.
export const updateRolePermission = async (roleId: number, permissionIds: number[]) => {
  const newPermissions = Array.from(new Set(permissionIds)).map((permissionId) => ({
    roleId,
    permissionId,
  }));
  await sequelize.transaction(async (transaction: unknown) => {
    await RolePermission.destroy({ where: { roleId }, transaction });
    await RolePermission.bulkCreate(newPermissions, { transaction });
  });
  return RolePermission.findAll({ where: { roleId } });
};

// Delete a role-permission assignment by its ID
export const deleteRolePermission = async (id: number) => RolePermission.destroy({ where: { id } });

// Get all permissions for a specific role
export const getRolePermissionsByRoleId = async (roleId: number) => {
  return RolePermission.findAll({ where: { roleId } });
};
