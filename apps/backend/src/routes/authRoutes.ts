import express from "express";
import { authenticateRefreshToken, logout } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/refresh-token", authenticateRefreshToken);
router.post("/logout", logout);

export default router;
