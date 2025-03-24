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
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleByName = exports.getRoleById = exports.getRoles = void 0;
const roleService = __importStar(require("../services/roleService"));
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield roleService.getRoles();
        return res.status(200).json(roles);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Roles", error });
    }
});
exports.getRoles = getRoles;
const getRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield roleService.getRoleById(Number(req.params.id));
        if (!role)
            return res.status(404).json({ error: "Role not found" });
        return res.status(200).json(role);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Role", error });
    }
});
exports.getRoleById = getRoleById;
const getRoleByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = yield roleService.getRoleByName(req.params.name);
        if (!role) {
            return res.status(404).json({ error: "Role not found" });
        }
        return res.status(200).json(role);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching Role", error });
    }
});
exports.getRoleByName = getRoleByName;
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newRole = yield roleService.createRole(req.body);
        return res.status(201).json(newRole);
    }
    catch (error) {
        console.log("ERROR: ", error);
        return res.status(500).json({ message: "Error creating Role", error });
    }
});
exports.createRole = createRole;
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedRole = yield roleService.updateRole(id, req.body);
        if (updatedRole) {
            return res.status(200).json(updatedRole);
        }
        else {
            return res.status(404).json({ message: "Role not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating Role", error });
    }
});
exports.updateRole = updateRole;
const deleteRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const deleted = yield roleService.deleteRole(id);
        if (deleted) {
            return res.status(204).end();
        }
        else {
            return res.status(404).json({ message: "Role not found" });
        }
    }
    catch (error) {
        return res.status(500).json({ message: "Error deleting Role", error });
    }
});
exports.deleteRole = deleteRole;
