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

export const updateUserRole = async (
  id: number,
  data: Omit<UserRole, "id">
) => {
  await UserRole.update(data, { where: { id } });
  return UserRole.findByPk(id);
};

export const deleteUserRole = async (id: number) => {
  return UserRole.destroy({ where: { id } });
};
