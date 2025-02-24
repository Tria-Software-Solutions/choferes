"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET_KEY || "";
const authenticateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(403).json({ error: "Required token" });
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
        if (err)
            return res.status(403).json({ error: "Invalid or expired token" });
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
