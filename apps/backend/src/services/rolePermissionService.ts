// Service for business logic and database operations related to role-permission assignments
import sequelize from "../config/database";
import { RolePermission } from "../models/RolePermission";
import { notifyManagementRoles } from "./notificationService";

// Get all role-permission assignments
export const getRolePermissions = async () => RolePermission.findAll();

// Create a new role-permission assignment
export const createRolePermission = async (data: Omit<RolePermission, "id">) => {
  const newRolePermission = await RolePermission.create(data);
  await newRolePermission.reload();
  await notifyManagementRoles({
    source: `role-permission-added:${newRolePermission.roleId}:${newRolePermission.permissionId}`,
    title: "Permiso agregado a un rol",
    message: `Se agregó el permiso #${newRolePermission.permissionId} al rol #${newRolePermission.roleId}.`,
    type: "info",
    category: "system",
    priority: "medium",
    actionUrl: "/settings",
    actionText: "Ver roles",
  });
  return newRolePermission;
};

// Replaces the permission set of a role atomically: if inserting the new set
// fails, the role keeps its previous permissions instead of ending up with none.
export const updateRolePermission = async (roleId: number, permissionIds: number[]) => {
  const current = await RolePermission.findAll({
    where: { roleId },
    attributes: ["permissionId"],
  });
  const currentIds = current.map((row) => row.permissionId);
  const nextIds = Array.from(new Set(permissionIds));

  const changed =
    currentIds.length !== nextIds.length || nextIds.some((id) => !currentIds.includes(id));

  const newPermissions = nextIds.map((permissionId) => ({ roleId, permissionId }));
  await sequelize.transaction(async (transaction: unknown) => {
    await RolePermission.destroy({ where: { roleId }, transaction });
    await RolePermission.bulkCreate(newPermissions, { transaction });
  });

  if (changed) {
    await notifyManagementRoles({
      source: `role-permissions-changed:${roleId}:${Date.now()}`,
      title: "Permisos de un rol modificados",
      message: `El rol #${roleId} cambió su conjunto de permisos (ahora ${nextIds.length}).`,
      type: "warning",
      category: "system",
      priority: "high",
      actionUrl: "/settings",
      actionText: "Ver roles",
    });
  }

  return RolePermission.findAll({ where: { roleId } });
};

// Delete a role-permission assignment by its ID
export const deleteRolePermission = async (id: number) => {
  const assignment = await RolePermission.findByPk(id);
  if (!assignment) return 0;
  const deleted = await RolePermission.destroy({ where: { id } });
  await notifyManagementRoles({
    source: `role-permission-removed:${assignment.roleId}:${assignment.permissionId}`,
    title: "Permiso retirado de un rol",
    message: `Se retiró el permiso #${assignment.permissionId} del rol #${assignment.roleId}.`,
    type: "warning",
    category: "system",
    priority: "medium",
    actionUrl: "/settings",
    actionText: "Ver roles",
  });
  return deleted;
};

// Get all permissions for a specific role
export const getRolePermissionsByRoleId = async (roleId: number) => {
  return RolePermission.findAll({ where: { roleId } });
};
