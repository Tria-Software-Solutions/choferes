"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateSecret_1 = require("../utils/generateSecret");
const { JWT_SECRET_KEY_REFRESH } = process.env;
const refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }
    jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET_KEY_REFRESH, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const userId = decoded.userId;
        (0, generateSecret_1.sendTokensInCookies)(userId, res);
        return res.status(200).json({ message: "Token refreshed successfully" });
    });
};
exports.refreshToken = refreshToken;
