import express from "express";
import * as userRoleController from "../controllers/userRoleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, userRoleController.getUserRoles);
router.get(
  "/:userId",
  authenticateToken,
  userRoleController.getUserRoleByUserId
);
router.post("/", userRoleController.createUserRole);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador"]),
  userRoleController.deleteUserRole
);

export default router;
