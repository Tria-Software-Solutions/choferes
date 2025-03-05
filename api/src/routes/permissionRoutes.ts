import express from "express";
import * as permissionController from "../controllers/permissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, permissionController.getPermissions);
router.get("/:id", authenticateToken, permissionController.getPermissionById);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Super Administrador"]),
  permissionController.createPermission
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador"]),
  permissionController.deletePermission
);

export default router;
