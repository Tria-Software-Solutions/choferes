import { User } from "../models/User";
import { Role } from "../models/Role";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Permission } from "../models/Permission";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret";

export const authenticateUser = async (username: string, password: string) => {
  if (!SECRET_KEY) throw new Error("JWT_SECRET_KEY is not set");

  const user = await User.findOne({
    where: { username },
    include: [
      {
        model: Role,
        through: { attributes: [] },
      },
    ],
  });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
    expiresIn: "1h",
  });
  return { user, token };
};

export const getUsers = async () => {
  return await User.findAll({
    include: [
      {
        model: Role,
        through: { attributes: [] },
      },
    ],
  });
};

export const getUserById = async (id: number) => {
  return await User.findByPk(id, { include: Role });
};

export const getUserByUsername = async (username: string) => {
  return await User.findOne({
    where: { username },
    include: Role,
  });
};

export const getUserPermissions = async (userId: number) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        include: [
          {
            model: Permission,
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  if (!user) return null;

  const permissions =
    user.Roles?.flatMap(
      (role) => role.Permissions?.map((permission) => permission.name) || []
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

export const deleteUser = async (id: number) => {
  return await User.destroy({ where: { id } });
};
