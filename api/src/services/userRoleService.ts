import { UserRole } from "../models/UserRole";

export const getUserRoles = async () => UserRole.findAll();

export const getUserRoleByUserId = async (userId: number) =>
  UserRole.findOne({
    where: {
      userId,
    },
  });

export const getUserRoleByRoleId = async (roleId: number) =>
  UserRole.findOne({
    where: {
      roleId,
    },
  });

export const createUserRole = async (data: Omit<UserRole, "id">) => {
  const newUserRole = await UserRole.create(data);
  await newUserRole.reload();
  return newUserRole;
};

export const updateUserRole = async (userId: number, roleId: number) => {
  await UserRole.update({ userId, roleId }, { where: { userId } });
  return UserRole.findOne({ where: { userId } });
};

export const deleteUserRole = async (id: number) => UserRole.destroy({ where: { id } });
