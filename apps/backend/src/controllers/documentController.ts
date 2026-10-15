// Controller de la página de Documentos (solo roles de gestión con permiso).
import { Request, Response } from "express";
import * as documentService from "../services/documentService";
import type { DocumentOwner } from "../services/documentService";
import { isServiceError, sendServerError, ServiceError } from "../utils/errors";
import { getUserId } from "../middleware/authorize";
import { User } from "../models/User";
import * as onlyofficeService from "../services/onlyofficeService";

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallbackMessage, error);
};

// ¿El cliente pidió el ámbito privado del propio usuario ("Solo para mí")?
const isPersonalScope = (source: Record<string, unknown>): boolean => {
  const { scope, personal } = source;
  return scope === "personal" || personal === "1" || personal === true || personal === "true";
};

/**
 * Resuelve el ámbito de la operación. El ámbito privado siempre se ata al
 * usuario autenticado (nunca a un id enviado por el cliente), así que un
 * usuario no puede leer ni escribir los documentos privados de otro.
 */
const resolveOwner = (req: Request, source: Record<string, unknown>): DocumentOwner => {
  if (isPersonalScope(source)) {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, "No autenticado");
    return documentService.userOwner(userId);
  }
  return documentService.resolveOwner({ ownerEmployeeId: source.ownerEmployeeId });
};

// GET /documents?ownerEmployeeId= — árbol de un ámbito (global si se omite).
// GET /documents?scope=personal — árbol privado del usuario autenticado.
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const owner = resolveOwner(req, req.query as Record<string, unknown>);
    const data = await documentService.listScope(owner);
    return res.status(200).json({ data });
  } catch (error) {
    return handleError(res, error, "Error al cargar los documentos");
  }
};

// POST /documents/folders — crea una carpeta en el ámbito indicado.
export const createFolder = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const owner = resolveOwner(req, body);
    const folder = await documentService.createFolder({
      name: body.name,
      parentId: body.parentId ?? null,
      ownerEmployeeId: owner.ownerEmployeeId,
      ownerUserId: owner.ownerUserId,
      userId: getUserId(req) ?? null,
    });
    return res.status(201).json(folder);
  } catch (error) {
    return handleError(res, error, "Error al crear la carpeta");
  }
};

// DELETE /documents/folders/:id — elimina la carpeta y su contenido.
export const deleteFolder = async (req: Request, res: Response) => {
  try {
    await documentService.deleteFolder(parseInt(req.params.id, 10));
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, "Error al eliminar la carpeta");
  }
};

// POST /documents/files — sube un archivo (data URL base64).
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const owner = resolveOwner(req, body);
    const document = await documentService.createDocument({
      folderId: body.folderId ?? null,
      ownerEmployeeId: owner.ownerEmployeeId,
      ownerUserId: owner.ownerUserId,
      name: body.name,
      mimeType: body.mimeType ?? null,
      size: body.size ?? 0,
      data: body.data,
      userId: getUserId(req) ?? null,
    });
    return res.status(201).json(document);
  } catch (error) {
    return handleError(res, error, "Error al subir el archivo");
  }
};

// GET /documents/files/:id — devuelve el archivo con su binario para descargar.
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const document = await documentService.getDocument(parseInt(req.params.id, 10));
    return res.status(200).json(document);
  } catch (error) {
    return handleError(res, error, "Error al descargar el archivo");
  }
};

// DELETE /documents/files/:id
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    await documentService.deleteDocument(parseInt(req.params.id, 10));
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, "Error al eliminar el archivo");
  }
};

// POST /documents/shares — comparte varios archivos con varios destinatarios.
export const shareDocuments = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const result = await documentService.shareDocuments({
      documentIds: body.documentIds,
      recipients: body.recipients,
      permission: body.permission,
      userId: getUserId(req) ?? null,
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error al compartir los archivos");
  }
};

// GET /documents/files/:id/shares — destinatarios actuales del archivo.
export const listShares = async (req: Request, res: Response) => {
  try {
    const data = await documentService.listShares(parseInt(req.params.id, 10));
    return res.status(200).json({ data });
  } catch (error) {
    return handleError(res, error, "Error al cargar los destinatarios");
  }
};

// DELETE /documents/shares/:id — quita un destinatario.
export const removeShare = async (req: Request, res: Response) => {
  try {
    await documentService.removeShare(parseInt(req.params.id, 10));
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error, "Error al quitar el destinatario");
  }
};

// URL pública de la API que el document server puede alcanzar. Se prefiere la
// variable de entorno (producción, detrás de proxy) y si no se deduce del
// request (con "trust proxy" el protocolo ya refleja X-Forwarded-Proto).
const publicApiBaseUrl = (req: Request): string => {
  const configured = process.env.PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return `${req.protocol}://${req.get("host")}/api`;
};

// GET /documents/files/:id/content?token= — sirve el binario al document server.
// No usa la sesión del usuario (el editor no la tiene): el token firmado y de
// vida corta de la URL es lo que autoriza, y solo para ese documento.
export const getDocumentContent = async (req: Request, res: Response) => {
  try {
    const documentId = onlyofficeService.verifyContentToken(String(req.query.token ?? ""));
    if (documentId !== parseInt(req.params.id, 10)) {
      return res.status(403).json({ message: "El token no corresponde a este archivo" });
    }
    const { buffer, mimeType, name } = await documentService.getDocumentContent(documentId);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", String(buffer.length));
    // El editor prefiere el nombre real del archivo al descargarlo.
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(name)}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    return handleError(res, error, "Error al descargar el archivo");
  }
};

// POST /documents/files/:id/callback — el document server avisa el estado de
// edición y, cuando corresponde, entrega el archivo editado. Hay que responder
// { error: 0 } o el editor muestra un error.
export const officeCallback = async (req: Request, res: Response) => {
  try {
    const payload = onlyofficeService.verifyCallbackToken(req.headers.authorization);
    if (onlyofficeService.isSaveStatus(payload.status) && payload.url) {
      const response = await fetch(payload.url);
      if (!response.ok) {
        throw new ServiceError(502, "No se pudo descargar el archivo editado");
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await documentService.saveDocumentContent(
        parseInt(req.params.id, 10),
        buffer,
        payload.filetype ?? null,
      );
    }
    return res.status(200).json({ error: 0 });
  } catch (error) {
    // Aun con error hay que contestar 200 para no dejar al editor reintentando;
    // el detalle queda en el log del servidor.
    if (isServiceError(error)) {
      return res.status(200).json({ error: 1, message: error.message });
    }
    return sendServerError(res, "Error al guardar el archivo editado", error);
  }
};

// GET /documents/files/:id/office-config — config firmada para abrir el editor.
// Solo Gerencia/Administrativo/SysAdmin (con `documents:manage`).
export const getOfficeConfig = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, "No autenticado");
    const user = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "username"],
    });
    const name = onlyofficeService.editorUserNameFor(
      user?.firstName,
      user?.lastName,
      user?.username,
    );
    const mode = req.query.mode === "view" ? "view" : "edit";
    const result = await documentService.buildOfficeEditor(
      parseInt(req.params.id, 10),
      { id: userId, name },
      publicApiBaseUrl(req),
      mode,
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error al abrir el editor de oficina");
  }
};

// POST /documents/move — mueve varios archivos/carpetas dentro del mismo ámbito.
export const moveItems = async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const owner = resolveOwner(req, body);
    const result = await documentService.moveItems({
      documentIds: body.documentIds,
      folderIds: body.folderIds,
      targetFolderId: body.targetFolderId,
      owner,
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error al mover los elementos");
  }
};
