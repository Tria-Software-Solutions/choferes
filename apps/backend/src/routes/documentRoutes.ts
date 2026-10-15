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

// Editor de oficina (ONLYOFFICE). El frontend pide la config firmada; el
// document server descarga el archivo y devuelve el editado al callback. Esas
// dos últimas rutas no llevan la sesión del usuario (el document server no la
// tiene): se autorizan con el token firmado de la URL y con el JWT de ONLYOFFICE.
router.get(
  "/files/:id/office-config",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.getOfficeConfig,
);
router.get("/files/:id/content", documentController.getDocumentContent);
router.post("/files/:id/callback", documentController.officeCallback);

// Compartición explícita: compartir varios archivos con varios destinatarios,
// listar sus destinatarios y quitarlos. Mover varios elementos a otra carpeta.
router.post(
  "/shares",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.shareDocuments,
);
router.get(
  "/files/:id/shares",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_DOCUMENTS),
  documentController.listShares,
);
router.delete(
  "/shares/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.removeShare,
);
router.post(
  "/move",
  authenticateToken,
  requirePermission(PERMISSION_CODES.MANAGE_DOCUMENTS),
  documentController.moveItems,
);

export default router;
