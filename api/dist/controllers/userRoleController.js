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
exports.deleteUserRole =
  exports.updateUserRole =
  exports.createUserRole =
  exports.getUserRoleByRoleId =
  exports.getUserRoleByUserId =
  exports.getUserRoles =
    void 0;
const userRoleService = __importStar(require("../services/userRoleService"));
const getUserRoles = async (req, res) => {
  try {
    const roles = await userRoleService.getUserRoles();
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching UserRoles", error });
  }
};
exports.getUserRoles = getUserRoles;
const getUserRoleByUserId = async (req, res) => {
  try {
    const user = await userRoleService.getUserRoleByUserId(Number(req.params.userId));
    if (!user) {
      return res.status(404).json({ message: "UserRole not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching UserRole", error });
  }
};
exports.getUserRoleByUserId = getUserRoleByUserId;
const getUserRoleByRoleId = async (req, res) => {
  try {
    const role = await userRoleService.getUserRoleByRoleId(Number(req.params.roleId));
    if (!role) {
      return res.status(404).json({ message: "UserRole not found" });
    }
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching UserRole", error });
  }
};
exports.getUserRoleByRoleId = getUserRoleByRoleId;
const createUserRole = async (req, res) => {
  try {
    const userRole = await userRoleService.createUserRole(req.body);
    return res.status(201).json(userRole);
  } catch (error) {
    return res.status(400).json({ message: "Error assigning UserRole", error });
  }
};
exports.createUserRole = createUserRole;
const updateUserRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUserRole = await userRoleService.updateUserRole(Number(id), req.body.roleId);
    if (updatedUserRole) {
      return res.status(200).json(updatedUserRole);
    } else {
      return res.status(404).json({ message: "UserRole not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating UserRole", error });
  }
};
exports.updateUserRole = updateUserRole;
const deleteUserRole = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await userRoleService.deleteUserRole(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "UserRole not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting UserRole", error });
  }
};
exports.deleteUserRole = deleteUserRole;
//# sourceMappingURL=userRoleController.js.map
