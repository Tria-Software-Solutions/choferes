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
    throw new Error("Missing JWT secret keys in environment variables");
}
const authenticateToken = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                error: "Unauthorized: Access token required",
                code: "MISSING_TOKEN"
            });
        }
        jsonwebtoken_1.default.verify(accessToken, JWT_SECRET_KEY, (error, decoded) => {
            if (error) {
                if (error.name === "TokenExpiredError") {
                    return res.status(401).json({
                        error: "Unauthorized: Token expired",
                        code: "TOKEN_EXPIRED"
                    });
                }
                else if (error.name === "JsonWebTokenError") {
                    return res.status(401).json({
                        error: "Unauthorized: Invalid token",
                        code: "INVALID_TOKEN"
                    });
                }
                else {
                    return res.status(401).json({
                        error: "Unauthorized: Token verification failed",
                        code: "TOKEN_VERIFICATION_FAILED"
                    });
                }
            }
            const payload = decoded;
            if (!payload.userId || typeof payload.userId !== 'string') {
                return res
                    .status(403)
                    .json({
                    error: "Forbidden: Invalid token payload",
                    code: "INVALID_PAYLOAD"
                });
            }
            req.user = { id: parseInt(payload.userId) };
            next();
        });
    }
    catch (error) {
        console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
        return res.status(500).json({
            error: "Internal server error",
            code: "AUTH_ERROR"
        });
    }
};
exports.authenticateToken = authenticateToken;
const authenticateRefreshToken = (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res
                .status(401)
                .json({
                error: "Unauthorized: Refresh token required",
                code: "MISSING_REFRESH_TOKEN"
            });
        }
        jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET_KEY_REFRESH, (refreshErr, refreshDecoded) => {
            if (refreshErr) {
                if (refreshErr.name === "TokenExpiredError") {
                    return res.status(401).json({
                        error: "Unauthorized: Refresh token expired",
                        code: "REFRESH_TOKEN_EXPIRED"
                    });
                }
                return res
                    .status(403)
                    .json({
                    error: "Forbidden: Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN"
                });
            }
            const payload = refreshDecoded;
            const userId = payload.userId;
            if (!userId || typeof userId !== 'string') {
                return res.status(403).json({
                    error: "Forbidden: Invalid refresh token payload",
                    code: "INVALID_REFRESH_PAYLOAD"
                });
            }
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = (0, generateSecret_1.generateTokens)(userId, res);
            res.setHeader("x-access-token", newAccessToken);
            res.setHeader("x-refresh-token", newRefreshToken);
            return res
                .status(200)
                .json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                message: "Tokens refreshed successfully"
            });
        });
    }
    catch (error) {
        console.error('Refresh token error:', error instanceof Error ? error.message : 'Unknown error');
        return res.status(500).json({
            error: "Internal server error",
            code: "REFRESH_ERROR"
        });
    }
};
exports.authenticateRefreshToken = authenticateRefreshToken;
