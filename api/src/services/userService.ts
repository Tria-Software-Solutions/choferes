import { User } from "../models/User";
import { Role } from "../models/Role";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "default_secret";

export const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    email,
    username,
    password: hashedPassword,
  });
  return user;
};

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
  const users = await User.findAll({ include: Role });
  return users;
};

export const getUserById = async (id: number) => {
  const user = await User.findByPk(id, { include: Role });
  return user;
};
