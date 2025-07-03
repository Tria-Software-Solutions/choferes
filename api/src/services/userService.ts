// Service for business logic and database operations related to users and authentication
import bcrypt from "bcrypt";
import { Response } from "express";
import { Op } from "sequelize";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { generateTokens } from "../utils/generateSecret";

// Authenticates a user by username/email and password, returns tokens and user info
export const authenticateUser = async (identifier: string, password: string, res: Response) => {
  const user = await User.findOne({
    where: { [Op.or]: [{ username: identifier }, { email: identifier }] },
    include: [
      {
        model: Role,
        as: "roles",
        include: [{ model: Permission, as: "permissions", through: { attributes: [] } }],
      },
    ],
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User is inactive");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    if (user.temporalPassword) {
      const isMatchWithTemporalPassword = await bcrypt.compare(password, user.temporalPassword);
      if (!isMatchWithTemporalPassword) {
        throw new Error("Incorrect password and temporary password");
      }
    } else {
      throw new Error("Incorrect password");
    }
  }

  const { accessToken, refreshToken } = generateTokens(user.id.toString(), res);

  return { user, accessToken, refreshToken };
};

// Fetches all users with their roles
export const getUsers = async () =>
  User.findAll({
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

// Fetches a user by ID with their roles
export const getUserById = async (id: number) =>
  User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

// Fetches a user by email with their roles
export const getUserByEmail = async (email: string) =>
  User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

// Fetches a user by username with their roles
export const getUserByUsername = async (username: string) =>
  User.findOne({
    where: { username },
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

// Fetches all permissions for a user by aggregating permissions from all roles
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
    user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.name)) || [];

  return Array.from(new Set(permissions));
};

// Creates a new user with hashed password
export const createUser = async (data: Omit<User, "id">) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return User.create(
    {
      ...data,
      password: hashedPassword,
    },
    { returning: true },
  );
};

// Updates user data by ID
export const updateUser = async (id: number, data: Omit<User, "id">) => {
  await User.update(data, { where: { id } });
  return User.findByPk(id);
};

// Updates the active status of a user
export const updateUserStatus = async (id: number, status: boolean) => {
  await User.update({ isActive: status }, { where: { id } });
  const user = await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
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
  console.log('Returned user:', JSON.stringify(user, null, 2));
  return user;
};

// Updates the password of a user (hashes new password)
export const updateUserPassword = async (id: number, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.update({ password: hashedPassword }, { where: { id } });
  return User.findByPk(id);
};

// Updates the temporary password of a user (hashes new password)
export const updateUserTemporalPassword = async (id: number, temporalPassword: string) => {
  const hashedTemporalPassword = await bcrypt.hash(temporalPassword, 10);
  await User.update({ temporalPassword: hashedTemporalPassword }, { where: { id } });
  return User.findByPk(id);
};

// Deletes a user by ID
export const deleteUser = async (id: number) => User.destroy({ where: { id } });
