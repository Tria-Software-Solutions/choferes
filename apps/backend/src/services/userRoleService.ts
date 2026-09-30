// Service for business logic and database operations related to user-role assignments
import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import { ServiceError } from "../utils/errors";
import { createNotification } from "./notificationService";

// Resolves an explicit role by id (404 when it doesn't exist).
export const resolveRoleById = async (roleId: number): Promise<Role> => {
  const role = await Role.findByPk(roleId);
  if (!role) throw new ServiceError(404, "Rol no encontrado");
  return role;
};

// Get all user-role assignments
export const getUserRoles = async () => UserRole.findAll();

// Get a user-role assignment by user ID
export const getUserRoleByUserId = async (userId: number) =>
  UserRole.findOne({
    where: {
      userId,
    },
  });

// Get a user-role assignment by role ID
export const getUserRoleByRoleId = async (roleId: number) =>
  UserRole.findOne({
    where: {
      roleId,
    },
  });

// Create a new user-role assignment
export const createUserRole = async (data: Omit<UserRole, "id">) => {
  const newUserRole = await UserRole.create(data);
  await newUserRole.reload();

  const role = await Role.findByPk(newUserRole.roleId);
  await createNotification(newUserRole.userId, {
    source: `role-granted:${newUserRole.userId}:${newUserRole.roleId}`,
    title: "Acceso asignado",
    message: `Se te asignó el rol ${role?.name ?? "conocido"} en la plataforma.`,
    type: "success",
    category: "system",
    priority: "high",
    actionUrl: "/dashboard",
    actionText: "Ir al panel",
  });

  return newUserRole;
};

// Update a user-role assignment by user ID
export const updateUserRole = async (userId: number, roleId: number) => {
  const previous = await UserRole.findOne({ where: { userId } });
  await UserRole.update({ userId, roleId }, { where: { userId } });
  const updated = await UserRole.findOne({ where: { userId } });

  if (previous && previous.roleId !== roleId) {
    const role = await Role.findByPk(roleId);
    await createNotification(userId, {
      source: `role-changed:${userId}:${roleId}:${Date.now()}`,
      title: "Tu rol cambió",
      message: `Tu rol en la plataforma cambió a ${role?.name ?? "uno nuevo"}.`,
      type: "warning",
      category: "system",
      priority: "high",
      actionUrl: "/dashboard",
      actionText: "Ir al panel",
    });
  }

  return updated;
};

// Delete a user-role assignment by its ID
export const deleteUserRole = async (id: number) => {
  const assignment = await UserRole.findByPk(id);
  if (!assignment) return 0;

  const role = await Role.findByPk(assignment.roleId);
  const deleted = await UserRole.destroy({ where: { id } });
  await createNotification(assignment.userId, {
    source: `role-revoked:${assignment.userId}:${assignment.roleId}`,
    title: "Acceso retirado",
    message: `Se te retiró el rol ${role?.name ?? "conocido"} de la plataforma.`,
    type: "warning",
    category: "system",
    priority: "high",
    actionUrl: "/dashboard",
    actionText: "Ir al panel",
  });
  return deleted;
};

// Assigns a role to a user without duplicating the row (idempotent).
export const assignRole = async (userId: number, roleId: number): Promise<UserRole> => {
  const existing = await UserRole.findOne({ where: { userId, roleId } });
  if (existing) return existing;
  return UserRole.create({ userId, roleId });
};
