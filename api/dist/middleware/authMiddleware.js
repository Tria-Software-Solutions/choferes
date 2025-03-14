"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateRefreshToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateSecret_1 = require("../utils/generateSecret");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;
if (!JWT_SECRET_KEY || !JWT_SECRET_KEY_REFRESH) {
    throw new Error("Missing token in environment variables");
}
const authenticateToken = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken)
            return res.status(401).json({ error: "Unauthorized: Token required" });
        jsonwebtoken_1.default.verify(accessToken, JWT_SECRET_KEY, (error, decoded) => {
            if (error) {
                if (error.name === "TokenExpiredError") {
                    return res.status(401).json({ error: "Unauthorized: Token expired" });
                }
                else {
                    return res.status(401).json({ error: "Unauthorized: Invalid token" });
                }
            }
            const payload = decoded;
            if (!payload.userId) {
                return res
                    .status(403)
                    .json({ error: "Forbidden: Invalid token payload" });
            }
            req.user = { id: payload.userId };
            next();
        });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.authenticateToken = authenticateToken;
const authenticateRefreshToken = (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res
                .status(401)
                .json({ error: "Unauthorized: Refresh token required" });
        }
        jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET_KEY_REFRESH, (refreshErr, refreshDecoded) => {
            if (refreshErr) {
                return res
                    .status(403)
                    .json({ error: "Forbidden: Invalid refresh token" });
            }
            const userId = refreshDecoded.userId;
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = (0, generateSecret_1.generateTokens)(userId, res);
            res.setHeader("x-access-token", newAccessToken);
            res.setHeader("x-refresh-token", newRefreshToken);
            return res
                .status(200)
                .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.authenticateRefreshToken = authenticateRefreshToken;
