import express from "express";
import * as userRoleController from "../controllers/userRoleController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, userRoleController.getUserRoles);
router.get(
  "/userId/:userId",
  authenticateToken,
  userRoleController.getUserRoleByUserId
);
router.get(
  "/roleId/:roleId",
  authenticateToken,
  userRoleController.getUserRoleByRoleId
);
router.post("/", userRoleController.createUserRole);
router.put("/:id", authenticateToken, userRoleController.updateUserRole);
router.delete("/:id", authenticateToken, userRoleController.deleteUserRole);

export default router;
