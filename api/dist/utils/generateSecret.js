"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTokenFormat = exports.generateSecureSecret = exports.generateTokens = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
const crypto = __importStar(require("crypto"));
dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
if (!JWT_SECRET_KEY || JWT_SECRET_KEY.length < 32) {
  throw new Error("JWT_SECRET_KEY must be at least 32 characters long");
}
if (!JWT_SECRET_KEY_REFRESH || JWT_SECRET_KEY_REFRESH.length < 32) {
  throw new Error("JWT_SECRET_KEY_REFRESH must be at least 32 characters long");
}
const generateTokens = (userId, res) => {
  const tokens = {
    accessToken: jwt.sign(
      {
        userId,
        iat: Math.floor(Date.now() / 1000),
        type: "access",
      },
      JWT_SECRET_KEY,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      },
    ),
    refreshToken: jwt.sign(
      {
        userId,
        iat: Math.floor(Date.now() / 1000),
        type: "refresh",
      },
      JWT_SECRET_KEY_REFRESH,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      },
    ),
  };
  const cookieOptions = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    path: "/",
    maxAge: 3600 * 1000,
  };
  res.cookie("accessToken", tokens.accessToken, cookieOptions);
  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return tokens;
};
exports.generateTokens = generateTokens;
const generateSecureSecret = () => {
  return crypto.randomBytes(32).toString("hex");
};
exports.generateSecureSecret = generateSecureSecret;
const validateTokenFormat = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }
  const parts = token.split(".");
  return parts.length === 3;
};
exports.validateTokenFormat = validateTokenFormat;
//# sourceMappingURL=generateSecret.js.map
