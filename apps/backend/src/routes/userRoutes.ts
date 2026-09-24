import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  allowSelfOrPermission,
  requireAnyPermission,
  requirePermission,
} from "../middleware/authorize";
import { PERMISSIONS } from "../constants/permissions";
import {
  idParam,
  userRules,
  userUpdateRules,
  userStatusUpdateRules,
  userPasswordUpdateRules,
  userTemporalPasswordUpdateRules,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

// Public
router.post("/login", userController.authenticateUser);

// User management (admin). Register is created by authenticated users with the
// relevant permission — the public Register page is not part of the app.
router.post(
  "/register",
  authenticateToken,
  requireAnyPermission([PERMISSIONS.CREATE_USER, PERMISSIONS.EDIT_USER]),
  userRules,
  validate,
  userController.createUser,
);

router.get("/", authenticateToken, paginationRules, validate, userController.getUsers);
router.get("/:id", authenticateToken, idParam, validate, userController.getUserById);
router.get("/email/:email", authenticateToken, userController.getUserByEmail);
router.get("/username/:username", authenticateToken, userController.getUserByUsername);
router.get(
  "/:id/permissions",
  authenticateToken,
  allowSelfOrPermission(PERMISSIONS.VIEW_USERS),
  idParam,
  validate,
  userController.getUserPermissions,
);
router.put(
  "/:id",
  authenticateToken,
  allowSelfOrPermission(PERMISSIONS.EDIT_USER),
  userUpdateRules,
  validate,
  userController.updateUser,
);
router.put(
  "/:id/status",
  authenticateToken,
  requirePermission(PERMISSIONS.ENABLE_DISABLE_USER),
  userStatusUpdateRules,
  validate,
  userController.updateUserStatus,
);
router.put(
  "/:id/password",
  authenticateToken,
  allowSelfOrPermission(PERMISSIONS.EDIT_USER),
  userPasswordUpdateRules,
  validate,
  userController.updateUserPassword,
);
router.put(
  "/:id/temporal-password",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_USER),
  userTemporalPasswordUpdateRules,
  validate,
  userController.updateUserTemporalPassword,
);
router.put(
  "/:id/settings",
  authenticateToken,
  allowSelfOrPermission(PERMISSIONS.EDIT_USER),
  userController.updateUserSettings,
);
router.delete(
  "/:id",
  authenticateToken,
  requireAnyPermission([PERMISSIONS.EDIT_USER, PERMISSIONS.ENABLE_DISABLE_USER]),
  idParam,
  validate,
  userController.deleteUser,
);

export default router;
