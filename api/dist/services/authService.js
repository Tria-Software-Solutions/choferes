"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const config_1 = __importDefault(require("../config/config"));
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = config_1.default;
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET_KEY,
    { expiresIn: "1h" },
  );
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET_KEY_REFRESH, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
