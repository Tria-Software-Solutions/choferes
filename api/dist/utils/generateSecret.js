"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecret = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateSecret = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString("hex");
};
exports.generateSecret = generateSecret;
const secret = (0, exports.generateSecret)();
console.log("Generated JWT Secret:", secret);
