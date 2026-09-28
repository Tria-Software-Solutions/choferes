import express from "express";
import { authenticateRefreshToken, logout } from "../middleware/authMiddleware";
import { authenticateUser } from "../controllers/userController";

const router = express.Router();

router.post("/login", authenticateUser);
router.post("/refresh-token", authenticateRefreshToken);
router.post("/logout", logout);

export default router;
