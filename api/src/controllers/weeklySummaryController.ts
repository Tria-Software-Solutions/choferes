import { Request, Response } from "express";
import * as weeklySummaryService from "../services/weeklySummaryService";

// Get all weekly summaries
export const getWeeklySummaries = async (req: Request, res: Response) => {
  try {
    const summaries = await weeklySummaryService.getWeeklySummaries();
    return res.status(200).json(summaries);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching WeeklySummaries", error });
  }
};

// Create a new weekly summary
export const createWeeklySummary = async (req: Request, res: Response) => {
  try {
    const newWeeklySummary = await weeklySummaryService.createWeeklySummary(req.body);
    return res.status(201).json(newWeeklySummary);
  } catch (error) {
    return res.status(500).json({ message: "Error creating WeeklySummary", error });
  }
};

// Get the current weekly summary for a specific employee and week
export const getCurrentWeeklySummary = async (req: Request, res: Response) => {
  try {
    const summary = await weeklySummaryService.getCurrentWeeklySummary(
      Number(req.params.id),
      Number(req.query.weekNumber),
      Number(req.query.month),
      Number(req.query.year),
    );
    if (summary) {
      return res.status(200).json(summary);
    }
    return res.status(404).json({ message: "WeeklySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching WeeklySummary", error });
  }
};

// Check if an employee has worked in the current weekly summary
export const hasWorkedCurrenWeeklySummary = async (req: Request, res: Response) => {
  try {
    const hasWorked = await weeklySummaryService.hasWorkedCurrenWeeklySummary(
      Number(req.params.id),
      Number(req.query.weekNumber),
      Number(req.query.month),
      Number(req.query.year),
    );
    return res.status(200).json({ hasWorked });
  } catch (error) {
    return res.status(500).json({ message: "Error checking work status", error });
  }
};

// Update a weekly summary by its ID
export const updateWeeklySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedSummary = await weeklySummaryService.updateWeeklySummary(id, req.body);
    if (updatedSummary) {
      return res.status(200).json(updatedSummary);
    }
    return res.status(404).json({ message: "WeeklySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating WeeklySummary", error });
  }
};

// Delete a weekly summary by its ID
export const deleteWeeklySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await weeklySummaryService.deleteWeeklySummary(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "WeeklySummary not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting WeeklySummary", error });
  }
};
