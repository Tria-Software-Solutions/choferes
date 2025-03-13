import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = config;

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET_KEY_REFRESH, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const generateSecret = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

// const secret = generateSecret();
// console.log("Generated JWT Secret:", secret);
