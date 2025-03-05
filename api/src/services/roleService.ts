import { Permission } from "../models/Permission";
import { Role } from "../models/Role";

export const getRoles = async () => {
  return await Role.findAll({ include: Permission });
};

export const getRoleById = async (id: number) => {
  return await Role.findByPk(id, { include: Permission });
};

export const createRole = async (data: Omit<Role, "id">) => {
  return await Role.create(data);
};

export const deleteRole = async (id: number) => {
  return await Role.destroy({ where: { id } });
};
