import { UserRole } from "../models/UserRole";

export const assignRoleToUser = async (data: Omit<UserRole, "id">) => {
  return UserRole.create(data);
};

export const getRolesByUser = async (userId: number) => {
  return UserRole.findAll({ where: { userId } });
};

export const removeRoleFromUser = async (userId: number, roleId: number) => {
  return UserRole.destroy({ where: { userId, roleId } });
};
