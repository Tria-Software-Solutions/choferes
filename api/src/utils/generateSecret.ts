import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { Response } from "express";

const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = process.env;

const generateAccessToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET_KEY, { expiresIn: "1h" });
};

const generateRefreshToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET_KEY_REFRESH, { expiresIn: "7d" });
};

export const sendTokensInCookies = (userId: number, res: Response) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  res.cookie("accessToken", accessToken, {
    domain:
      process.env.NODE_ENV === "production"
        ? ".choferesdealquilercr.vercel.app"
        : "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 3600 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    domain:
      process.env.NODE_ENV === "production"
        ? ".choferesdealquilercr.vercel.app"
        : "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const generateSecret = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

// const secret = generateSecret();
// console.log("Generated JWT Secret:", secret);
