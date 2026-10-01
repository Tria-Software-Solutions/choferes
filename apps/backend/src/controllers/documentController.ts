// Controller de la página de Documentos (solo roles de gestión con permiso).
import { Request, Response } from "express";
import * as documentService from "../services/documentService";
import { isServiceError, sendServerError } from "../utils/errors";
import { getUserId } from "../middleware/authorize";

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallbackMessage, error);
};

// GET /documents?ownerEmployeeId= — árbol de un ámbito (global si se omite).
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const raw = req.query.ownerEmployeeId;
    const owner =
      raw === undefined || raw === null || raw === "" || raw === "null" ? null : Number(raw);
    if (owner !== null && (!Number.isInteger(owner) || owner <= 0)) {
      return res.status(400).json({ message: "Empleado inválido" });
    }
    const data = await documentService.listScope(owner);
    return res.status(200).json({ data });
  } catch (error) {
    return handleError(res, error, "Error al cargar los documentos");
  }
};

// POST /documents/folders — crea una carpeta en el ámbito indicado.
export const createFolder = async (req: Request, res: Response) => {
  try {
    const folder = await documentService.createFolder({
      name: req.body?.name,
      parentId: req.body?.parentId ?? null,
      ownerEmployeeId: req.body?.ownerEmployeeId ?? null,
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
    const document = await documentService.createDocument({
      folderId: req.body?.folderId ?? null,
      ownerEmployeeId: req.body?.ownerEmployeeId ?? null,
      name: req.body?.name,
      mimeType: req.body?.mimeType ?? null,
      size: req.body?.size ?? 0,
      data: req.body?.data,
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
