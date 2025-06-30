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
exports.deletePermission =
  exports.createPermission =
  exports.getPermissionsByNames =
  exports.getPermissionById =
  exports.getPermissions =
    void 0;
const permissionService = __importStar(require("../services/permissionService"));
const getPermissions = async (req, res) => {
  try {
    const permissions = await permissionService.getPermissions();
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permissions", error });
  }
};
exports.getPermissions = getPermissions;
const getPermissionById = async (req, res) => {
  try {
    const permission = await permissionService.getPermissionById(Number(req.params.id));
    if (!permission) return res.status(404).json({ error: "Permission not found" });
    return res.status(200).json(permission);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permission", error });
  }
};
exports.getPermissionById = getPermissionById;
const getPermissionsByNames = async (req, res) => {
  try {
    const decodedPermissionsNames = decodeURIComponent(req.params.names);
    const permissionsNamesArray = decodedPermissionsNames.split(",").map((name) => name.trim());
    if (permissionsNamesArray.length === 0) {
      return res.status(400).json({ error: "Invalid permissions array" });
    }
    const permissions = await permissionService.getPermissionsByNames(permissionsNamesArray);
    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ error: "Permissions not found" });
    }
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permissions", error });
  }
};
exports.getPermissionsByNames = getPermissionsByNames;
const createPermission = async (req, res) => {
  try {
    const { name } = req.body;
    const permission = await permissionService.createPermission(name);
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ message: "Error creating Permission", error });
  }
};
exports.createPermission = createPermission;
const deletePermission = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await permissionService.deletePermission(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "Permission not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Permission", error });
  }
};
exports.deletePermission = deletePermission;
//# sourceMappingURL=permissionController.js.map
