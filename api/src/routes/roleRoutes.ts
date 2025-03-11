import express from "express";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, roleController.getRoles);
router.get("/:id", authenticateToken, roleController.getRoleById);
router.get("/role/:name", authenticateToken, roleController.getRoleByName);
router.post("/", authenticateToken, roleController.createRole);
router.put("/:id", authenticateToken, roleController.updateRole);
router.delete("/:id", authenticateToken, roleController.deleteRole);

export default router;
