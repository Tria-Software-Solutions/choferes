import express from "express";
import * as documentController from "../controllers/documentController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";

const router = express.Router();

// Página de Documentos (Gerencia / Administrativo / SysAdmin). Ver y descargar
// exige `documents:view`; crear carpetas, subir y eliminar exigen
// `documents:manage`.
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_DOCUMENTS),
  documentController.getDocuments,
);
router.post(
  "/folders",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.createFolder,
);
router.delete(
  "/folders/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.deleteFolder,
);
router.post(
  "/files",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.uploadDocument,
);
router.get(
  "/files/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_DOCUMENTS),
  documentController.downloadDocument,
);
router.delete(
  "/files/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.deleteDocument,
);

export default router;
