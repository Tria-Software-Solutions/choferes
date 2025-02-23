import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:id", authenticateToken, userController.getUserById);

export default router;
