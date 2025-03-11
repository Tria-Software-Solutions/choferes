import { Permission } from "../models/Permission";
import { Role } from "../models/Role";

export const getRoles = async () => {
  return await Role.findAll({
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  });
};

export const getRoleById = async (id: number) => {
  return await Role.findByPk(id, {
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  });
};

export const getRoleByName = async (name: string) => {
  return await Role.findOne({
    where: { name },
    include: [
      {
        model: Permission,
        as: "permissions",
        through: { attributes: [] },
      },
    ],
  });
};

export const createRole = async (data: Omit<Role, "id">) => {
  return await Role.create(data, { returning: true });
};

export const updateRole = async (id: number, data: Omit<Role, "id">) => {
  await Role.update(data, { where: { id } });
  return Role.findByPk(id);
};

export const deleteRole = async (id: number) => {
  return await Role.destroy({ where: { id } });
};
