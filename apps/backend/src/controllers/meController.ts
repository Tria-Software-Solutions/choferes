// Controller for the signed-in user's personal panel ("Mi Panel").
// Every handler is scoped to users.employeeId via meService, so no permission
// beyond a valid session is required.
import { Request, Response } from "express";
import * as meService from "../services/meService";
import { isServiceError, sendServerError } from "../utils/errors";
import { getUserId } from "../middleware/authorize";

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallbackMessage, error);
};

// GET /me/overview — horario, vacaciones, amonestaciones, licencias, horas,
// pagos y tareas del empleado vinculado al usuario autenticado.
export const getMyOverview = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const overview = await meService.getMyOverview(userId);
    return res.status(200).json(overview);
  } catch (error) {
    return handleError(res, error, "Error al cargar tu panel");
  }
};

// POST /me/vacations — solicitud de vacaciones del propio empleado.
export const createMyVacation = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const vacation = await meService.createMyVacation(userId, req.body);
    return res.status(201).json(vacation);
  } catch (error) {
    return handleError(res, error, "Error al solicitar vacaciones");
  }
};

// PUT /me/profile — el empleado actualiza sus propios datos personales.
// El servicio filtra por lista blanca: lo laboral (puesto, contrato, tarifa)
// solo lo cambia administración.
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const employee = await meService.updateMyProfile(userId, req.body);
    return res.status(200).json(employee);
  } catch (error) {
    return handleError(res, error, "Error al guardar tus datos");
  }
};

// GET /me/licenses/requests — estado de las solicitudes propias de licencia.
export const getMyLicenseRequests = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const data = await meService.getMyLicenseRequests(userId);
    return res.status(200).json({ data });
  } catch (error) {
    return handleError(res, error, "Error al cargar tus solicitudes de licencia");
  }
};

// GET /me/documents — documentos compartidos y del propio empleado.
export const getMyDocuments = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const data = await meService.getMyDocuments(userId);
    return res.status(200).json(data);
  } catch (error) {
    return handleError(res, error, "Error al cargar tus documentos");
  }
};

// POST /me/licenses/requests — el empleado pide crear o editar una licencia.
// Queda pendiente hasta que Gerencia/Administrativo la revise.
export const createMyLicenseRequest = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: authentication required" });
    }
    const request = await meService.createMyLicenseRequest(userId, req.body);
    return res.status(201).json(request);
  } catch (error) {
    return handleError(res, error, "Error al enviar la solicitud de licencia");
  }
};
