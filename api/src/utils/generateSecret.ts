import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Response } from "express";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;

export const generateTokens = (userId: string, res: Response) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ userId }, JWT_SECRET_KEY_REFRESH, {
    expiresIn: "7d",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 3600 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

//generateSecret
//node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
