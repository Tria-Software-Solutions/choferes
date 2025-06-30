import { Op } from "sequelize";
import { Permission } from "../models/Permission";

export const getPermissions = async () => Permission.findAll();

export const getPermissionById = async (id: number) => Permission.findByPk(id);

export const getPermissionByName = async (name: string) =>
  Permission.findOne({
    where: { name },
  });

export const getPermissionsByNames = async (names: string[]) =>
  Permission.findAll({
    where: {
      name: {
        [Op.in]: names,
      },
    },
  });

export const createPermission = async (data: Omit<Permission, "id">) => {
  const newPermission = await Permission.create(data);
  await newPermission.reload();
  return newPermission;
};

export const updatePermission = async (id: number, data: Omit<Permission, "id">) => {
  await Permission.update(data, { where: { id } });
  return Permission.findByPk(id);
};

export const deletePermission = async (id: number) => Permission.destroy({ where: { id } });
