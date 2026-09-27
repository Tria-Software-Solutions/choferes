// Controller for HTTP requests related to disciplinary actions (amonestaciones).
import { Request, Response } from "express";
import * as disciplinaryService from "../services/disciplinaryActionService";
import { isServiceError, sendServerError } from "../utils/errors";
import { getUserId } from "../middleware/authorize";

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallbackMessage, error);
};

export const getDisciplinaryActions = async (req: Request, res: Response) => {
  try {
    const result = await disciplinaryService.getDisciplinaryActions(
      req.query as Record<string, string>,
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error fetching disciplinary actions");
  }
};

export const getDisciplinaryActionById = async (req: Request, res: Response) => {
  try {
    const action = await disciplinaryService.getDisciplinaryActionById(parseInt(req.params.id, 10));
    if (action) return res.status(200).json(action);
    return res.status(404).json({ message: "Amonestación no encontrada" });
  } catch (error) {
    return handleError(res, error, "Error fetching disciplinary action");
  }
};

export const createDisciplinaryAction = async (req: Request, res: Response) => {
  try {
    const action = await disciplinaryService.createDisciplinaryAction({
      ...req.body,
      createdBy: getUserId(req),
    });
    return res.status(201).json(action);
  } catch (error) {
    return handleError(res, error, "Error creating disciplinary action");
  }
};

export const updateDisciplinaryAction = async (req: Request, res: Response) => {
  try {
    const action = await disciplinaryService.updateDisciplinaryAction(
      parseInt(req.params.id, 10),
      req.body,
    );
    if (action) return res.status(200).json(action);
    return res.status(404).json({ message: "Amonestación no encontrada" });
  } catch (error) {
    return handleError(res, error, "Error updating disciplinary action");
  }
};

export const deleteDisciplinaryAction = async (req: Request, res: Response) => {
  try {
    const deleted = await disciplinaryService.deleteDisciplinaryAction(parseInt(req.params.id, 10));
    if (deleted) return res.status(204).end();
    return res.status(404).json({ message: "Amonestación no encontrada" });
  } catch (error) {
    return handleError(res, error, "Error deleting disciplinary action");
  }
};
