// Service for business logic and database operations related to user-role assignments
import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import { ServiceError } from "../utils/errors";

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
  return newUserRole;
};

// Update a user-role assignment by user ID
export const updateUserRole = async (userId: number, roleId: number) => {
  await UserRole.update({ userId, roleId }, { where: { userId } });
  return UserRole.findOne({ where: { userId } });
};

// Delete a user-role assignment by its ID
export const deleteUserRole = async (id: number) => UserRole.destroy({ where: { id } });

// Assigns a role to a user without duplicating the row (idempotent).
export const assignRole = async (userId: number, roleId: number): Promise<UserRole> => {
  const existing = await UserRole.findOne({ where: { userId, roleId } });
  if (existing) return existing;
  return UserRole.create({ userId, roleId });
};
