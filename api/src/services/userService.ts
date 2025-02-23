import { User } from "../models/User";
import { Role } from "../models/Role";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "default_secret";

export const createUser = async (username: string, password: string, roleId: number) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword, roleId });
  return user;
};

export const authenticateUser = async (username: string, password: string) => {
  const user = await User.findOne({ where: { username }, include: Role });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  const token = jwt.sign({ userId: user.id, role: user.roleId }, secretKey, { expiresIn: "1h" });
  return token;
};

export const getUsers = async () => {
    const users = await User.findAll({ include: Role });
    return users;
  };

export const getUserById = async (id: number) => {
  const user = await User.findByPk(id, { include: Role });
  return user;
};