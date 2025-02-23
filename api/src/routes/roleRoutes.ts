import express from "express";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, roleController.createRole);
router.get("/", authenticateToken, roleController.getRoles);
router.get("/:id", authenticateToken, roleController.getRoleById);

export default router;
