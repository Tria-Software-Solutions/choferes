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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserRole = exports.createUserRole = exports.getUserRoleByUserId = exports.getUserRoles = void 0;
const userRoleService = __importStar(require("../services/userRoleService"));
const getUserRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const roles = yield userRoleService.getUserRoles(Number(userId));
        res.status(200).json(roles);
    }
    catch (error) {
        res.status(400).json({ message: "Error fetching UserRole", error });
    }
});
exports.getUserRoles = getUserRoles;
const getUserRoleByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userRoleService.getUserRoleByUserId(Number(req.params.userId));
        if (!user) {
            return res.status(404).json({ message: "UserRole not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching UserRole", error });
    }
});
exports.getUserRoleByUserId = getUserRoleByUserId;
const createUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = yield userRoleService.createUserRole(req.body);
        res.status(201).json(userRole);
    }
    catch (error) {
        res.status(400).json({ message: "Error assigning UserRole", error });
    }
});
exports.createUserRole = createUserRole;
const deleteUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deleted = yield userRoleService.deleteUserRole(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: "UserRole not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error deleting UserRole", error });
    }
});
exports.deleteUserRole = deleteUserRole;
