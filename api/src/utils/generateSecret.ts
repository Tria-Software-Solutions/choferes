import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Response } from "express";
import * as crypto from "crypto";

dotenv.config();

const { JWT_SECRET_KEY } = process.env;
const { JWT_SECRET_KEY_REFRESH } = process.env;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

if (!JWT_SECRET_KEY || JWT_SECRET_KEY.length < 32) {
  throw new Error("JWT_SECRET_KEY must be at least 32 characters long");
}

if (!JWT_SECRET_KEY_REFRESH || JWT_SECRET_KEY_REFRESH.length < 32) {
  throw new Error("JWT_SECRET_KEY_REFRESH must be at least 32 characters long");
}

export const generateTokens = (userId: string, res: Response) => {
  const tokens = {
    accessToken: jwt.sign(
      {
        userId,
        iat: Math.floor(Date.now() / 1000),
        type: "access",
      },
      JWT_SECRET_KEY,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      },
    ),
    refreshToken: jwt.sign(
      {
        userId,
        iat: Math.floor(Date.now() / 1000),
        type: "refresh",
      },
      JWT_SECRET_KEY_REFRESH,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      },
    ),
  };

  const cookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: 3600 * 1000,
  };

  res.cookie("accessToken", tokens.accessToken, cookieOptions);

  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return tokens;
};

export const generateSecureSecret = (): string => crypto.randomBytes(32).toString("hex");

export const validateTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  return parts.length === 3;
};
