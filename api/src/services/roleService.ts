import { Permission } from "../models/Permission";
import { Role } from "../models/Role";

export const getRoles = async () =>
  Role.findAll({
  include: [
    {
      model: Permission,
      as: "permissions",
      through: { attributes: [] },
    },
  ],
});

export const getRoleById = async (id: number) =>
  Role.findByPk(id, {
  include: [
    {
      model: Permission,
      as: "permissions",
      through: { attributes: [] },
    },
  ],
});

export const getRoleByName = async (name: string) =>
  Role.findOne({
  where: { name },
  include: [
    {
      model: Permission,
      as: "permissions",
      through: { attributes: [] },
    },
  ],
});

export const createRole = async (data: Omit<Role, "id">) => {
  const newRole = await Role.create(data);
  await newRole.reload();
  return newRole;
};

export const updateRole = async (id: number, data: Omit<Role, "id">) => {
  await Role.update(data, { where: { id } });
  return Role.findByPk(id);
};

export const deleteRole = async (id: number) => Role.destroy({ where: { id } });
