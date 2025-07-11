// Controller for handling HTTP requests related to monthly summaries
// Provides endpoints for CRUD operations and fetching summaries for employees
import { Request, Response } from "express";
import * as monthlySummaryService from "../services/monthlySummaryService";

// Get all monthly summaries
export const getMonthlySummaries = async (req: Request, res: Response) => {
  try {
    const summaries = await monthlySummaryService.getMonthlySummaries();
    return res.status(200).json(summaries);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching MonthlySummaries", error });
  }
};

// Get the current monthly summary for a specific employee and month
export const getCurrentMonthlySummary = async (req: Request, res: Response) => {
  try {
    const summary = await monthlySummaryService.getCurrentMonthlySummary(
      Number(req.params.id),
      Number(req.query.month),
      Number(req.query.year),
    );
    if (summary) {
      return res.status(200).json(summary);
    }
    return res.status(404).json({ message: "MonthlySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching MonthlySummary", error });
  }
};

// Create a new monthly summary
export const createMonthlySummary = async (req: Request, res: Response) => {
  try {
    const newMonthlySummary = await monthlySummaryService.createMonthlySummary(req.body);
    return res.status(201).json(newMonthlySummary);
  } catch (error) {
    return res.status(500).json({ message: "Error creating MonthlySummary", error });
  }
};

// Update a monthly summary by its ID
export const updateMonthlySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedSummary = await monthlySummaryService.updateMonthlySummary(id, req.body);
    if (updatedSummary) {
      return res.status(200).json(updatedSummary);
    }
    return res.status(404).json({ message: "MonthlySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating MonthlySummary", error });
  }
};

// Delete a monthly summary by its ID
export const deleteMonthlySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await monthlySummaryService.deleteMonthlySummary(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "MonthlySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting MonthlySummary", error });
  }
};

// Delete all monthly summaries (bulk)
export const deleteAllMonthlySummaries = async (req: Request, res: Response) => {
  try {
    await monthlySummaryService.deleteAllMonthlySummaries();
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: "Error deleting all monthly summaries", error });
  }
};
