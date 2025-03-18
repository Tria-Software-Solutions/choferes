import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Response } from "express";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;

console.log(
  "JWT_SECRET_KEY:",
  JWT_SECRET_KEY ? "Cargada ✅" : "No definida ❌"
);
console.log(
  "JWT_SECRET_KEY_REFRESH:",
  JWT_SECRET_KEY_REFRESH ? "Cargada ✅" : "No definida ❌"
);

export const generateTokens = (userId: string, res: Response) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ userId }, JWT_SECRET_KEY_REFRESH, {
    expiresIn: "7d",
  });

  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 3600 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  console.log("Headers enviados:", res.getHeaders());

  return { accessToken, refreshToken };
};

//generateSecret
//node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
