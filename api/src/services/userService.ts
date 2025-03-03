import { User } from "../models/User";
import { Role } from "../models/Role";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
  return await User.findAll({ include: Role });
};

export const getUserById = async (id: number) => {
  return await User.findByPk(id, { include: Role });
};

export const createUser = async (data: Omit<User, "id">) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await User.create({
    ...data,
    password: hashedPassword,
  });
};

export const deleteUser = async (id: number) => {
  return await User.destroy({ where: { id } });
};