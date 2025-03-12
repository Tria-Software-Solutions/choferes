"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = config_1.default;
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET_KEY, {
        expiresIn: "1h",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET_KEY_REFRESH, {
        expiresIn: "7d",
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
