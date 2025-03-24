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
exports.deleteUser = exports.updateUserTemporalPassword = exports.updateUserPassword = exports.updateUserStatus = exports.updateUser = exports.createUser = exports.getUserPermissions = exports.getUserByUsername = exports.getUserById = exports.getUsers = exports.authenticateUser = void 0;
const userService = __importStar(require("../services/userService"));
const authenticateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password } = req.body;
        const { user, accessToken, refreshToken } = yield userService.authenticateUser(identifier, password, res);
        return res.status(200).json({ user, accessToken, refreshToken });
    }
    catch (error) {
        return res.status(401).json({ message: "Error login User", error });
    }
});
exports.authenticateUser = authenticateUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userService.getUsers();
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Users", error });
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getUserById(Number(req.params.id));
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching User", error });
    }
});
exports.getUserById = getUserById;
const getUserByUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching User", error });
    }
});
exports.getUserByUsername = getUserByUsername;
const getUserPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.getUserPermissions(Number(req.params.id));
        if (!user) {
            return res.status(404).json({ message: "User Permissions not found" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching User Permissions", error });
    }
});
exports.getUserPermissions = getUserPermissions;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newUser = yield userService.createUser(req.body);
        return res.status(201).json(newUser);
    }
    catch (error) {
        return res.status(500).json({ message: "Error registering User", error });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = yield userService.updateUser(id, req.body);
        if (updatedUser) {
            return res.status(200).json(updatedUser);
        }
        else {
            return res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating User", error });
    }
});
exports.updateUser = updateUser;
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = yield userService.updateUserStatus(id, req.body.isActive);
        if (updatedUser) {
            return res.status(200).json(updatedUser);
        }
        else {
            return res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.log("ERROR: ", error);
        return res.status(500).json({ message: "Error updating User", error });
    }
});
exports.updateUserStatus = updateUserStatus;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = yield userService.updateUserPassword(id, req.body.password);
        if (updatedUser) {
            return res.status(200).json(updatedUser);
        }
        else {
            return res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating User", error });
    }
});
exports.updateUserPassword = updateUserPassword;
const updateUserTemporalPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedUser = yield userService.updateUserTemporalPassword(id, req.body.temporalPassword);
        if (updatedUser) {
            return res.status(200).json(updatedUser);
        }
        else {
            return res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating User", error });
    }
});
exports.updateUserTemporalPassword = updateUserTemporalPassword;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deleted = yield userService.deleteUser(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error deleting User", error });
    }
});
exports.deleteUser = deleteUser;
