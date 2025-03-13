import express from "express";
import { authenticateRefreshToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/refresh-token", authenticateRefreshToken);

export default router;
