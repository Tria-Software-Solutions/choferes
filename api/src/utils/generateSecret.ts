import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Response } from "express";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const generateTokens = (userId: string, res: Response) => {
  const tokens = {
    accessToken: jwt.sign({ userId }, JWT_SECRET_KEY, { expiresIn: "1h" }),
    refreshToken: jwt.sign({ userId }, JWT_SECRET_KEY_REFRESH, {
      expiresIn: "7d",
    }),
  };

  const cookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" as "none" : "lax" as "lax",
    path: "/",
  };

  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge: 3600 * 1000,
  });
  
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return tokens;
};

//generateSecret
//node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
