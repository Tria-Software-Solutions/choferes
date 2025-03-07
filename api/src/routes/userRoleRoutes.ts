import express from "express";
import * as userRoleController from "../controllers/userRoleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

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
  authorizeRole([Roles.MANAGER]),
  userRoleController.deleteUserRole
);

export default router;
