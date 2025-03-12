import jwt from "jsonwebtoken";
import config from "../config/config";

const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = config;

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ userId }, JWT_SECRET_KEY_REFRESH, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};
