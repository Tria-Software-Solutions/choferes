import express from "express";
import * as rolePermissionController from "../controllers/rolePermissionController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, rolePermissionController.getRolePermissions);
router.post("/", authenticateToken, rolePermissionController.createRolePermission);
router.put("/:id", authenticateToken, rolePermissionController.updateRolePermissions);
router.delete("/:id", authenticateToken, rolePermissionController.deleteRolePermission);

export default router;
