import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/refresh-token", authenticateToken, authController.refreshToken);

export default router;
