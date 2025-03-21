import { UserRole } from "../models/UserRole";
import * as RoleService from "../services/roleService";

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
  const newUserRole = await UserRole.create(data);
  await newUserRole.reload();
  return newUserRole;
};

export const updateUserRole = async (userId: number, roleId: number) => {
  const role = await RoleService.getRoleById(roleId);
  if (!role) throw new Error("Role not found");;
  const [updated] = await UserRole.update({ roleId }, { where: { userId } });
  if (updated === 0) return null;
  return await UserRole.findOne({ where: { userId } });
};

export const deleteUserRole = async (id: number) => {
  return UserRole.destroy({ where: { id } });
};
