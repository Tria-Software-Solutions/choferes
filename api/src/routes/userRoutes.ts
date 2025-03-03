import express from "express";
import * as userController from "../controllers/userController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/login", userController.authenticateUser);
router.get("/", authenticateToken, userController.getUsers);
router.post("/register", userController.createUser);
router.get("/:id", authenticateToken, userController.getUserById);
router.delete('/:id', authenticateToken, userController.deleteUser);

export default router;
