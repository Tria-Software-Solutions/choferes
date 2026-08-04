import { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import * as userService from "../services/userService";
import * as employeeService from "../services/employeeService";

// Avatars are stored directly in the database as base64 data URLs.
// This avoids the ephemeral filesystem problem in production (Render free tier
// wipes local files on restart/redeploy), which caused avatars to disappear
// or render as corrupt images.
const storage = multer.memoryStorage();

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

// Upload avatar for a user — stores the image as a base64 data URL in the DB
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
    }

    // The mimetype is the real detected type (multer), so the data URL
    // always declares the correct format — no more "corrupt" images caused
    // by mismatched extensions.
    const avatarDataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    await userService.updateUser(userId, { avatar: avatarDataUrl });

    return res.status(200).json({
      message: "Avatar actualizado exitosamente",
      avatar: avatarDataUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al subir avatar", error });
  }
};

// Delete avatar for a user
export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);

    await userService.updateUser(userId, { avatar: null as unknown as undefined });

    return res.status(200).json({
      message: "Avatar eliminado exitosamente",
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar avatar", error });
  }
};

// Upload avatar for an employee — stores the image as a base64 data URL in the DB
export const uploadEmployeeAvatar = async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.id, 10);
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "No se proporcionó ninguna imagen" });
    }

    // Same approach as user avatars: real mimetype (multer) → correct data URL.
    const avatarDataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const employee = await employeeService.updateEmployee(employeeId, {
      avatar: avatarDataUrl,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Avatar actualizado exitosamente",
      avatar: avatarDataUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al subir avatar", error });
  }
};

// Delete avatar for an employee
export const deleteEmployeeAvatar = async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.id, 10);

    const employee = await employeeService.updateEmployee(employeeId, {
      avatar: null as unknown as undefined,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({
      message: "Avatar eliminado exitosamente",
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar avatar", error });
  }
};
