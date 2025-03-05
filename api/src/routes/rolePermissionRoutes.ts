import express from "express";
import * as rolePermissionController from "../controllers/rolePermissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

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
  authorizeRole(["Super Administrador"]),
  rolePermissionController.deleteRolePermission
);

export default router;
