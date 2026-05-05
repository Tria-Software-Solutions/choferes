// Service for business logic and database operations related to permissions
import { Op } from "sequelize";
import { Permission } from "../models/Permission";

// Get all permissions
export const getPermissions = async () => Permission.findAll();

// Get a permission by its ID
export const getPermissionById = async (id: number) => Permission.findByPk(id);

// Get a permission by its name
export const getPermissionByName = async (name: string) =>
  Permission.findOne({
    where: { name },
  });

// Get permissions by an array of names
export const getPermissionsByNames = async (names: string[]) =>
  Permission.findAll({
    where: {
      name: {
        [Op.in]: names,
      },
    },
  });

// Create a new permission
export const createPermission = async (data: Omit<Permission, "id">) => {
  const newPermission = await Permission.create(data);
  await newPermission.reload();
  return newPermission;
};

// Update a permission by its ID
export const updatePermission = async (id: number, data: Omit<Permission, "id">) => {
  await Permission.update(data, { where: { id } });
  return Permission.findByPk(id);
};

// Delete a permission by its ID
export const deletePermission = async (id: number) => Permission.destroy({ where: { id } });
