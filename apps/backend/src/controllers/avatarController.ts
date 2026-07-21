import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import * as userService from "../services/userService";

// Configure multer storage for avatar uploads
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads/avatars");
const AVATAR_BASE_URL = "/uploads/avatars";

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

/* global Express */
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (JPEG, PNG, GIF, WebP)"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Upload avatar for a user
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
    }

    // Delete old avatar file if it exists
    const user = await userService.getUserById(userId);
    if (user?.avatar) {
      const oldPath = path.join(UPLOADS_DIR, path.basename(user.avatar));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatarUrl = `${AVATAR_BASE_URL}/${file.filename}`;

    // Update user with avatar path
    await userService.updateUser(userId, { avatar: avatarUrl });

    return res.status(200).json({
      message: "Avatar actualizado exitosamente",
      avatar: avatarUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al subir avatar", error });
  }
};

// Delete avatar for a user
export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    const user = await userService.getUserById(userId);
    if (user?.avatar) {
      const oldPath = path.join(UPLOADS_DIR, path.basename(user.avatar));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await userService.updateUser(userId, { avatar: null as unknown as undefined });

    return res.status(200).json({
      message: "Avatar eliminado exitosamente",
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar avatar", error });
  }
};
