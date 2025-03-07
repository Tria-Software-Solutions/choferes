import express from "express";
import * as permissionController from "../controllers/permissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, permissionController.getPermissions);
router.get("/:id", authenticateToken, permissionController.getPermissionById);
router.post(
  "/",
  authenticateToken,
  authorizeRole([Roles.MANAGER]),
  permissionController.createPermission
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER]),
  permissionController.deletePermission
);

export default router;
