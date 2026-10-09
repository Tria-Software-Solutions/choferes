// Utility functions for JWT token generation, secure secret generation, and token format validation
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

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? ("none" as const) : ("lax" as const),
  path: "/",
};

// Generate access and refresh JWT tokens and set them as cookies in the response.
// `tokenVersion` is embedded so a password change (which bumps the column) can
// invalidate every previously issued token for that user.
export const generateTokens = (userId: string, res: Response, tokenVersion = 0) => {
  const tokens = {
    accessToken: jwt.sign(
      {
        userId,
        ver: tokenVersion,
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
        ver: tokenVersion,
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

  res.cookie("accessToken", tokens.accessToken, { ...AUTH_COOKIE_OPTIONS, maxAge: 3600 * 1000 });

  res.cookie("refreshToken", tokens.refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return tokens;
};

// Expires both auth cookies. The options must match the ones used when the
// cookies were set, otherwise the browser keeps the originals.
export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", AUTH_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", AUTH_COOKIE_OPTIONS);
};

// Generate a cryptographically secure random secret (hex string)
export const generateSecureSecret = (): string => crypto.randomBytes(32).toString("hex");

// Validate that a string is in JWT token format (three dot-separated parts)
export const validateTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  return parts.length === 3;
};
