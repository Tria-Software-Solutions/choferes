import { Permission } from "../models/Permission";

export const createPermission = async (name: string) => {
  const permission = await Permission.create({ name });
  return permission;
};

export const getPermissions = async () => {
  const permissions = await Permission.findAll();
  return permissions;
};

export const getPermissionById = async (id: number) => {
  const permission = await Permission.findByPk(id);
  return permission;
};
