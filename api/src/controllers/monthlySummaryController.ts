import { Request, Response } from 'express';
import * as monthlySummaryService from '../services/monthlySummaryService'

export const createMonthlySummary = async (req: Request, res: Response) => {
  try {
    const newMonthlySummary = await monthlySummaryService.createMonthlySummary(req.body);
    return res.status(201).json(newMonthlySummary);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating MonthlySummary', error });
  }
};

export const getAllMonthlySummaries = async (req: Request, res: Response) => {
  try {
    const summaries = await monthlySummaryService.getAllMonthlySummaries();
    return res.status(200).json(summaries);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching MonthlySummaries', error });
  }
};

export const getMonthlySummaryById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const summary = await monthlySummaryService.getMonthlySummaryById(id);
    if (summary) {
      return res.status(200).json(summary);
    } else {
      return res.status(404).json({ message: 'MonthlySummary not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching MonthlySummary', error });
  }
};

export const updateMonthlySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedSummary = await monthlySummaryService.updateMonthlySummary(id, req.body);
    if (updatedSummary) {
      return res.status(200).json(updatedSummary);
    } else {
      return res.status(404).json({ message: 'MonthlySummary not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating MonthlySummary', error });
  }
};

export const deleteMonthlySummary = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await monthlySummaryService.deleteMonthlySummary(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: 'MonthlySummary not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting MonthlySummary', error });
  }
};
