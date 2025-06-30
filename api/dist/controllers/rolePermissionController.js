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
exports.deleteRolePermission =
  exports.updateRolePermissions =
  exports.createRolePermission =
  exports.getRolePermissions =
    void 0;
const rolePermissionService = __importStar(require("../services/rolePermissionService"));
const getRolePermissions = async (req, res) => {
  try {
    const permissions = await rolePermissionService.getRolePermissions();
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching RolePermissions", error });
  }
};
exports.getRolePermissions = getRolePermissions;
const createRolePermission = async (req, res) => {
  try {
    const rolePermission = await rolePermissionService.createRolePermission(req.body);
    return res.status(201).json(rolePermission);
  } catch (error) {
    return res.status(400).json({ message: "Error assigning RolePermission", error });
  }
};
exports.createRolePermission = createRolePermission;
const updateRolePermissions = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const { permissionIds } = req.body;
    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ message: "Permission Ids must be an array" });
    }
    const updatedRolePermissions = await rolePermissionService.updateRolePermission(
      roleId,
      permissionIds,
    );
    if (updatedRolePermissions) {
      return res.status(200).json(updatedRolePermissions);
    } else {
      return res.status(404).json({ message: "Role not found or no permissions updated" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating role permissions", error });
  }
};
exports.updateRolePermissions = updateRolePermissions;
const deleteRolePermission = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await rolePermissionService.deleteRolePermission(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "RolePermission not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting RolePermission", error });
  }
};
exports.deleteRolePermission = deleteRolePermission;
//# sourceMappingURL=rolePermissionController.js.map
