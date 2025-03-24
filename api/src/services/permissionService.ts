import { Op } from "sequelize";
import { Permission } from "../models/Permission";

export const getPermissions = async () => {
  return await Permission.findAll();
};

export const getPermissionById = async (id: number) => {
  return await Permission.findByPk(id);
};

export const getPermissionsByNames = async (names: string[]) => {
  return await Permission.findAll({
    where: {
      name: {
        [Op.in]: names, 
      },
    },
  });
};

export const createPermission = async (data: Omit<Permission, "id">) => {
  const newPermission = await Permission.create(data);
  await newPermission.reload();
  return newPermission;
};

export const updatePermission = async (
  id: number,
  data: Omit<Permission, "id">
) => {
  await Permission.update(data, { where: { id } });
  return Permission.findByPk(id);
};

export const deletePermission = async (id: number) => {
  return await Permission.destroy({ where: { id } });
};
