import config from "../config/config";

const jwt = require("jsonwebtoken");

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
