import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import bcrypt from "bcrypt";
import { Response } from "express";
import {
  sendTokensInCookies,
} from "../utils/generateSecret";

export const authenticateUser = async (username: string, password: string, res: Response) => {
  const user = await User.findOne({
    where: { username },
    include: [
      {
        model: Role,
        as: "roles",
        include: [
          { model: Permission, as: "permissions", through: { attributes: [] } },
        ],
      },
    ],
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  sendTokensInCookies(user.id, res);

  return { user };
};

export const getUsers = async () => {
  return await User.findAll({
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });
};

export const getUserById = async (id: number) => {
  return await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });
};

export const getUserByUsername = async (username: string) => {
  return await User.findOne({
    where: { username },
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });
};

export const getUserPermissions = async (userId: number) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: "roles",
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  if (!user) return null;

  const permissions =
    user.roles?.flatMap((role) =>
      role.permissions?.map((permission) => permission.name)
    ) || [];

  return Array.from(new Set(permissions));
};

export const createUser = async (data: Omit<User, "id">) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await User.create(
    {
      ...data,
      password: hashedPassword,
    },
    { returning: true }
  );
};

export const updateUser = async (id: number, data: Omit<User, "id">) => {
  await User.update(data, { where: { id } });
  return User.findByPk(id);
};

export const deleteUser = async (id: number) => {
  return await User.destroy({ where: { id } });
};
