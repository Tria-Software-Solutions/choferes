"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;
console.log("JWT_SECRET_KEY:", JWT_SECRET_KEY ? "Cargada ✅" : "No definida ❌");
console.log("JWT_SECRET_KEY_REFRESH:", JWT_SECRET_KEY_REFRESH ? "Cargada ✅" : "No definida ❌");
const generateTokens = (userId, res) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET_KEY, {
        expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET_KEY_REFRESH, {
        expiresIn: "7d",
    });
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 3600 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("Headers enviados:", res.getHeaders());
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
//generateSecret
//node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
