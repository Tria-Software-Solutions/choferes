import { Permission } from "../models/Permission";

export const getPermissions = async () => {
  return await Permission.findAll();
};

export const getPermissionById = async (id: number) => {
  return await Permission.findByPk(id);
};

export const createPermission = async (data: Omit<Permission, "id">) => {
  return await Permission.create(data);
};
