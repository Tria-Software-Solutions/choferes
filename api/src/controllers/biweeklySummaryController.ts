import { Request, Response } from "express";
import * as biweeklySummaryService from "../services/biweeklySummaryService";

export const getBiweeklySummaries = async (req: Request, res: Response) => {
  try {
    const summaries = await biweeklySummaryService.getBiweeklySummaries();
    return res.status(200).json(summaries);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching BiweeklySummaries", error });
  }
};

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

export const createBiweeklySummary = async (req: Request, res: Response) => {
  try {
    const newBiweeklySummary = await biweeklySummaryService.createBiweeklySummary(req.body);
    return res.status(201).json(newBiweeklySummary);
  } catch (error) {
    return res.status(500).json({ message: "Error creating BiweeklySummary", error });
  }
};

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
