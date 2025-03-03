import { UserRole } from "../models/UserRole";

export const getUserRoles = async (userId: number) => {
  return UserRole.findAll({ where: { userId } });
};

export const createUserRole = async (data: Omit<UserRole, "id">) => {
  return UserRole.create(data);
};

export const deleteUserRole = async (userId: number, roleId: number) => {
  return UserRole.destroy({ where: { userId, roleId } });
};
