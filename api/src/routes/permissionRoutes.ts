import express from "express";
import * as permissionController from "../controllers/permissionController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, permissionController.createPermission);
router.get("/", authenticateToken, permissionController.getPermissions);
router.get("/:id", authenticateToken, permissionController.getPermissionById);

export default router;
