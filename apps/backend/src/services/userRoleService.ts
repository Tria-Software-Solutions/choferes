// Service for business logic and database operations related to user-role assignments
import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import { ServiceError } from "../utils/errors";
import { notifyAccountRoleChange } from "./notificationService";

// Resolves an explicit role by id (404 when it doesn't exist).
export const resolveRoleById = async (roleId: number): Promise<Role> => {
  const role = await Role.findByPk(roleId);
  if (!role) throw new ServiceError(404, "Rol no encontrado");
  return role;
};

// Get all user-role assignments
export const getUserRoles = async () => UserRole.findAll();

// Get a single user-role assignment by its own id
export const getUserRoleById = (id: number) => UserRole.findByPk(id);

// Role ids currently assigned to a user
export const getRoleIdsByUserId = async (userId: number): Promise<number[]> => {
  const rows = await UserRole.findAll({ where: { userId }, attributes: ["roleId"] });
  return rows.map((row) => row.roleId);
};

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
  await notifyAccountRoleChange(newUserRole.userId, {
    action: `se le asignó el rol ${role?.name ?? "conocido"}`,
    type: "success",
  });

  return newUserRole;
};

// Replaces the roles of a user (the :id param is the user id) with the given
// set. A single id keeps working for callers that only know one role.
export const updateUserRole = async (userId: number, roleIds: number | number[]) => {
  const target = Array.from(new Set(Array.isArray(roleIds) ? roleIds : [roleIds]));
  const previous = await UserRole.findAll({ where: { userId } });
  const previousIds = previous.map((row) => row.roleId);

  const unchanged =
    previousIds.length === target.length && target.every((id) => previousIds.includes(id));
  if (!unchanged) {
    const removed = previousIds.filter((id) => !target.includes(id));
    if (removed.length > 0) await UserRole.destroy({ where: { userId, roleId: removed } });
    await Promise.all(
      target.filter((id) => !previousIds.includes(id)).map((id) => assignRole(userId, id)),
    );

    if (previous.length > 0) {
      const roles = await Role.findAll({ where: { id: target } });
      await notifyAccountRoleChange(userId, {
        action: `sus roles cambiaron a ${roles.map((role) => role.name).join(", ") || "ninguno"}`,
        type: "warning",
        priority: "high",
      });
    }
  }

  const updated = await UserRole.findOne({ where: { userId } });
  return updated;
};

// Delete a user-role assignment by its ID
export const deleteUserRole = async (id: number) => {
  const assignment = await UserRole.findByPk(id);
  if (!assignment) return 0;

  const role = await Role.findByPk(assignment.roleId);
  const deleted = await UserRole.destroy({ where: { id } });
  await notifyAccountRoleChange(assignment.userId, {
    action: `se le retiró el rol ${role?.name ?? "conocido"}`,
    type: "warning",
    priority: "high",
  });
  return deleted;
};

// Assigns a role to a user without duplicating the row (idempotent).
export const assignRole = async (
  userId: number,
  roleId: number,
  transaction?: unknown,
): Promise<UserRole> => {
  const existing = await UserRole.findOne(
    transaction ? { where: { userId, roleId }, transaction } : { where: { userId, roleId } },
  );
  if (existing) return existing;
  return transaction
    ? UserRole.create({ userId, roleId }, { transaction })
    : UserRole.create({ userId, roleId });
};
