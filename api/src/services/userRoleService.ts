import { UserRole } from "../models/UserRole";

export const assignRoleToUser = async (userId: number, roleId: number) => {
  return UserRole.create({ userId, roleId });
};

export const getRolesByUser = async (userId: number) => {
  return UserRole.findAll({ where: { userId } });
};

export const removeRoleFromUser = async (userId: number, roleId: number) => {
  return UserRole.destroy({ where: { userId, roleId } });
};
