import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.post("/login", userController.authenticateUser);
router.get("/", authenticateToken, userController.getUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.get("/username/:username", userController.getUserByUsername);
router.get("/:id/permissions", userController.getUserPermissions);
router.post("/register", userController.createUser);
router.delete(
  "/:id",
  authenticateToken,
  userController.deleteUser
);

export default router;
