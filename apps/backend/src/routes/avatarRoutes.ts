import express from "express";
import {
  upload as multerUpload,
  uploadAvatar,
  deleteAvatar,
} from "../controllers/avatarController";
import { authenticateToken } from "../middleware/authMiddleware";
import { allowSelfOrPermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";

const router = express.Router();

router.post(
  "/:id/avatar",
  authenticateToken,
  allowSelfOrPermission(PERMISSION_CODES.EDIT_USER),
  multerUpload.single("avatar"),
  uploadAvatar,
);

router.delete(
  "/:id/avatar",
  authenticateToken,
  allowSelfOrPermission(PERMISSION_CODES.EDIT_USER),
  deleteAvatar,
);

export default router;
