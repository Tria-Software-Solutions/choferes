"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateSecret_1 = require("../utils/generateSecret");
const { JWT_SECRET_KEY, JWT_SECRET_KEY_REFRESH } = process.env;
if (!JWT_SECRET_KEY) {
    throw new Error("Missing JWT_SECRET_KEY in environment variables");
}
if (!JWT_SECRET_KEY_REFRESH) {
    throw new Error("Missing JWT_SECRET_KEY_REFRESH in environment variables");
}
const authenticateToken = (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized: Token required" });
        }
        jsonwebtoken_1.default.verify(accessToken, JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    const refreshToken = req.cookies.refreshToken;
                    if (!refreshToken) {
                        return res
                            .status(401)
                            .json({ error: "Unauthorized: Refresh token required" });
                    }
                    jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET_KEY_REFRESH, (refreshErr, refreshDecoded) => {
                        if (refreshErr) {
                            return res
                                .status(401)
                                .json({ error: "Unauthorized: Invalid refresh token" });
                        }
                        const userId = refreshDecoded.userId;
                        (0, generateSecret_1.sendTokensInCookies)(userId, res);
                        req.user = { id: userId };
                        next();
                    });
                }
                else {
                    return res.status(401).json({ error: "Unauthorized: Invalid token" });
                }
            }
            const payload = decoded;
            req.user = { id: payload.userId };
            next();
        });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.authenticateToken = authenticateToken;
