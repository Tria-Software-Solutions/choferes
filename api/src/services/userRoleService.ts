import { UserRole } from "../models/UserRole";

export const getUserRoles = async () => {
  return UserRole.findAll();
};

export const getUserRoleByUserId = async (userId: number) => {
  return await UserRole.findOne({
    where: {
      userId: userId,
    },
  });
};

export const createUserRole = async (data: Omit<UserRole, "id">) => {
  return UserRole.create(data);
};

export const deleteUserRole = async (id: number) => {
  return UserRole.destroy({ where: { id } });
};
