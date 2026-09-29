import express from "express";
import * as permissionController from "../controllers/permissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import { idParam, permissionNamesParam, paginationRules, validate } from "../middleware/validation";

const router = express.Router();

// The permission catalog is code-owned (see @choferes/shared PERMISSION_CATALOG),
// so there is intentionally no create/update/delete endpoint here — permissions
// are provisioned through migrations/seeders instead of at runtime.
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_ROLES),
  paginationRules,
  validate,
  permissionController.getPermissions,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_ROLES),
  idParam,
  validate,
  permissionController.getPermissionById,
);
router.get(
  "/names/:names",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_ROLES),
  permissionNamesParam,
  validate,
  permissionController.getPermissionsByNames,
);

export default router;
