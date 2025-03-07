import express from "express";
import * as rolePermissionController from "../controllers/rolePermissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, rolePermissionController.getRolePermissions);
router.post(
  "/",
  authenticateToken,
  rolePermissionController.createRolePermission
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER]),
  rolePermissionController.deleteRolePermission
);

export default router;
