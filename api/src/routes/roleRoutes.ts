import express from "express";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, roleController.getRoles);
router.get("/:id", authenticateToken, roleController.getRoleById);
router.post("/", authenticateToken, roleController.createRole);

export default router;
