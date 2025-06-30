"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authService_1 = require("../services/authService");
const { JWT_SECRET_KEY_REFRESH } = process.env;
const refreshToken = (req, res) => {
  const refreshToken = req.headers["x-refresh-token"];
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }
  jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET_KEY_REFRESH, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const userId = decoded.userId;
    const { accessToken, refreshToken: newRefreshToken } = (0, authService_1.generateTokens)(
      userId,
    );
    return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  });
};
exports.refreshToken = refreshToken;
