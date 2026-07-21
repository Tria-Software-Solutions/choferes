import express from "express";
import {
  upload as multerUpload,
  uploadAvatar,
  deleteAvatar,
} from "../controllers/avatarController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/:id/avatar", authenticateToken, multerUpload.single("avatar"), uploadAvatar);

router.delete("/:id/avatar", authenticateToken, deleteAvatar);

export default router;
