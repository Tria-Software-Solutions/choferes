import { UserRole } from "../models/UserRole";

export const getUserRoles = async (userId: number) => {
  return UserRole.findAll({ where: { userId } });
};

export const getUserRoleByUserId = async (userId: number) => {
  return await UserRole.findByPk(userId);
};

export const createUserRole = async (data: Omit<UserRole, "id">) => {
  return UserRole.create(data);
};

export const deleteUserRole = async (id: number) => {
  return UserRole.destroy({ where: { id } });
};
