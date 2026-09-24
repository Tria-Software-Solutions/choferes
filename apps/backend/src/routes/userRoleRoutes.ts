import express from "express";
import * as userRoleController from "../controllers/userRoleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAnyPermission, requirePermission } from "../middleware/authorize";
import { PERMISSIONS } from "../constants/permissions";

const router = express.Router();

router.get("/", authenticateToken, userRoleController.getUserRoles);
router.get("/userId/:userId", authenticateToken, userRoleController.getUserRoleByUserId);
router.get("/roleId/:roleId", authenticateToken, userRoleController.getUserRoleByRoleId);
router.post(
  "/",
  authenticateToken,
  requireAnyPermission([PERMISSIONS.CREATE_USER, PERMISSIONS.EDIT_USER]),
  userRoleController.createUserRole,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_USER),
  userRoleController.updateUserRole,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_USER),
  userRoleController.deleteUserRole,
);

export default router;
