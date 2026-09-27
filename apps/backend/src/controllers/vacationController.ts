// Controller for HTTP requests related to vacation requests.
import { Request, Response } from "express";
import * as vacationService from "../services/vacationService";
import { isServiceError, sendServerError } from "../utils/errors";
import { getUserId } from "../middleware/authorize";

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallbackMessage, error);
};

// GET /vacations — paginated list with employee + approver
export const getVacations = async (req: Request, res: Response) => {
  try {
    const result = await vacationService.getVacations(req.query as Record<string, string>);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error fetching vacations");
  }
};

// GET /vacations/:id — single request with employee + approver
export const getVacationById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vacation = await vacationService.getVacationById(id);
    if (vacation) {
      return res.status(200).json(vacation);
    }
    return res.status(404).json({ message: "Vacation not found" });
  } catch (error) {
    return handleError(res, error, "Error fetching vacation");
  }
};

// POST /vacations — creates a pending request (days computed server-side)
export const createVacation = async (req: Request, res: Response) => {
  try {
    const vacation = await vacationService.createVacation(req.body);
    return res.status(201).json(vacation);
  } catch (error) {
    return handleError(res, error, "Error creating vacation");
  }
};

// PUT /vacations/:id — field edits + approve/reject (balance is adjusted here)
export const updateVacation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const approvedBy = getUserId(req);
    const vacation = await vacationService.updateVacation(id, {
      ...req.body,
      approvedBy,
    });
    if (vacation) {
      return res.status(200).json(vacation);
    }
    return res.status(404).json({ message: "Vacation not found" });
  } catch (error) {
    return handleError(res, error, "Error updating vacation");
  }
};

// DELETE /vacations/:id (an approved one returns its days to the balance)
export const deleteVacation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await vacationService.deleteVacation(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Vacation not found" });
  } catch (error) {
    return handleError(res, error, "Error deleting vacation");
  }
};
