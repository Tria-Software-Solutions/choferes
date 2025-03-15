import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Response } from "express";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;

export const generateTokens = (userId: string, res: Response) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET_KEY, {
    expiresIn: "1h",
    algorithm: "HS256",
  });

  const refreshToken = jwt.sign({ userId }, JWT_SECRET_KEY_REFRESH, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 3600 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

export const generateSecret = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

// const secret = generateSecret();
// console.log("Generated JWT Secret:", secret);
