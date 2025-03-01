import { Role } from "../models/Role";

export const createRole = async (data: Omit<Role, "id">) => {
  return await Role.create(data);
};

export const getRoles = async () => {
  return await Role.findAll();
};

export const getRoleById = async (id: number) => {
  return await Role.findByPk(id);
};
