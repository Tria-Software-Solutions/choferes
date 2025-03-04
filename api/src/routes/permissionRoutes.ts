import express from "express";
import * as permissionController from "../controllers/permissionController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, permissionController.getPermissions);
router.get("/:id", authenticateToken, permissionController.getPermissionById);
router.post("/", authenticateToken, permissionController.createPermission);
router.delete('/:id', authenticateToken, permissionController.deletePermission);

export default router;
