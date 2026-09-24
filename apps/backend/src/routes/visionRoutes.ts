import express from "express";
import visionController from "../controllers/visionController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// Proxies Gemini Vision calls so the API key never reaches the browser.
router.post("/gemini", authenticateToken, visionController.processImage);

export default router;
