// Controller for the employee self-service license change requests.
// Employees propose changes; Gerencia/Administrativo approve or reject them.
import { Request, Response } from "express";
import * as licenseRequestService from "../services/licenseRequestService";
import { isServiceError, sendServerError } from "../utils/errors";
import { getUserId } from "../middleware/authorize";

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallbackMessage, error);
};

// GET /license-requests — solicitudes pendientes (y revisadas) para el editor.
export const getLicenseRequests = async (req: Request, res: Response) => {
  try {
    const data = await licenseRequestService.listRequests(
      req.query as Record<string, string | undefined>,
    );
    return res.status(200).json({ data });
  } catch (error) {
    return handleError(res, error, "Error al cargar las solicitudes de licencia");
  }
};

// POST /license-requests/:id/approve — aplica el cambio a la licencia.
export const approveLicenseRequest = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const request = await licenseRequestService.approveRequest(parseInt(req.params.id, 10), userId);
    return res.status(200).json(request);
  } catch (error) {
    return handleError(res, error, "Error al aprobar la solicitud");
  }
};

// POST /license-requests/:id/reject — rechaza la solicitud con un motivo.
export const rejectLicenseRequest = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const request = await licenseRequestService.rejectRequest(
      parseInt(req.params.id, 10),
      userId,
      req.body?.reviewNotes ?? null,
    );
    return res.status(200).json(request);
  } catch (error) {
    return handleError(res, error, "Error al rechazar la solicitud");
  }
};
