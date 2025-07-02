// Service for business logic and database operations related to user-role assignments
import { UserRole } from "../models/UserRole";

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
