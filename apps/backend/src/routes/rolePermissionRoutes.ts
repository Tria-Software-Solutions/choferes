import express from "express";
import * as rolePermissionController from "../controllers/rolePermissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";

const router = express.Router();

router.get("/", authenticateToken, rolePermissionController.getRolePermissions);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_ROLE),
  rolePermissionController.createRolePermission,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_ROLE),
  rolePermissionController.updateRolePermissions,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_ROLE),
  rolePermissionController.deleteRolePermission,
);
router.get("/role/:roleId", authenticateToken, rolePermissionController.getRolePermissionsByRoleId);

export default router;
