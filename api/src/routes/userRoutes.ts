import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/login", userController.authenticateUser);
router.post("/register", userController.createUser);
router.get("/", authenticateToken, userController.getUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.get("/email/:email", userController.getUserByEmail);
router.get("/username/:username", userController.getUserByUsername);
router.get("/:id/permissions", userController.getUserPermissions);
router.put("/:id", authenticateToken, userController.updateUser);
router.put("/:id/status", authenticateToken, userController.updateUserStatus);
router.put(
  "/:id/password",
  authenticateToken,
  userController.updateUserPassword
);
router.put(
  "/:id/temporal-password",
  authenticateToken,
  userController.updateUserTemporalPassword
);
router.delete("/:id", authenticateToken, userController.deleteUser);

export default router;
