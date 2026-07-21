import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  idParam,
  userUpdateRules,
  userStatusUpdateRules,
  userPasswordUpdateRules,
  userTemporalPasswordUpdateRules,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.post("/login", userController.authenticateUser);
router.get("/", authenticateToken, paginationRules, validate, userController.getUsers);
router.get("/:id", authenticateToken, idParam, validate, userController.getUserById);
router.get("/email/:email", userController.getUserByEmail);
router.get("/username/:username", userController.getUserByUsername);
router.get("/:id/permissions", idParam, validate, userController.getUserPermissions);
router.put("/:id", authenticateToken, userUpdateRules, validate, userController.updateUser);
router.put(
  "/:id/status",
  authenticateToken,
  userStatusUpdateRules,
  validate,
  userController.updateUserStatus,
);
router.put(
  "/:id/password",
  authenticateToken,
  userPasswordUpdateRules,
  validate,
  userController.updateUserPassword,
);
router.put(
  "/:id/temporal-password",
  authenticateToken,
  userTemporalPasswordUpdateRules,
  validate,
  userController.updateUserTemporalPassword,
);
router.delete("/:id", authenticateToken, idParam, validate, userController.deleteUser);

export default router;
