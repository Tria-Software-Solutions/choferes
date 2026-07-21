// Controller for handling HTTP requests related to biweekly summaries
// Provides endpoints for CRUD operations and fetching summaries for employees
import { Request, Response } from "express";
import * as biweeklySummaryService from "../services/biweeklySummaryService";

// Get all biweekly summaries (paginated)
export const getBiweeklySummaries = async (req: Request, res: Response) => {
  try {
    const result = await biweeklySummaryService.getBiweeklySummaries(
      req.query as { page?: string; limit?: string },
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching BiweeklySummaries", error });
  }
};

// Get the current biweekly summary for a specific employee and biweek
export const getCurrentBiweeklySummary = async (req: Request, res: Response) => {
  try {
    const summary = await biweeklySummaryService.getCurrentBiweeklySummary(
      Number(req.params.id),
      Number(req.query.biweekNumber),
      Number(req.query.month),
      Number(req.query.year),
    );
    if (summary) {
      return res.status(200).json(summary);
    }
    return res.status(404).json({ message: "BiweeklySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching BiweeklySummary", error });
  }
};

// Create a new biweekly summary
export const createBiweeklySummary = async (req: Request, res: Response) => {
  try {
    const newBiweeklySummary = await biweeklySummaryService.createBiweeklySummary(req.body);
    return res.status(201).json(newBiweeklySummary);
  } catch (error) {
    const fkError =
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "SequelizeForeignKeyConstraintError";
    if (fkError) {
      const err = error as { fields?: Record<string, unknown> };
      return res.status(409).json({
        message: "El empleado no existe en la base de datos",
        field: err.fields,
        code: "FOREIGN_KEY_VIOLATION",
      });
    }
    return res.status(500).json({ message: "Error creating BiweeklySummary", error });
  }
};

// Update a biweekly summary by its ID
export const updateBiweeklySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedSummary = await biweeklySummaryService.updateBiweeklySummary(id, req.body);
    if (updatedSummary) {
      return res.status(200).json(updatedSummary);
    }
    return res.status(404).json({ message: "BiweeklySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating BiweeklySummary", error });
  }
};

// Delete a biweekly summary by its ID
export const deleteBiweeklySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await biweeklySummaryService.deleteBiweeklySummary(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "BiweeklySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting BiweeklySummary", error });
  }
};

// Delete all biweekly summaries (bulk)
export const deleteAllBiweeklySummaries = async (req: Request, res: Response) => {
  try {
    await biweeklySummaryService.deleteAllBiweeklySummaries();
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: "Error deleting all biweekly summaries", error });
  }
};
