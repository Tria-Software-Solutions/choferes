import { Role } from "../models/Role";

export const createRole = async (name: string) => {
  const role = await Role.create({ name });
  return role;
};

export const getRoles = async () => {
    const roles = await Role.findAll();
    return roles;
  };

export const getRoleById = async (id: number) => {
  const role = await Role.findByPk(id);
  return role;
};