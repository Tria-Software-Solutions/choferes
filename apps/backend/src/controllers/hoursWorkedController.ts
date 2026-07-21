// Controller for handling HTTP requests related to hours worked records
// Provides endpoints for CRUD operations on hours worked
import { Request, Response } from "express";
import * as hoursWorkedService from "../services/hoursWorkedService";

// Get all hours worked records (paginated)
export const getHoursWorked = async (req: Request, res: Response) => {
  try {
    const result = await hoursWorkedService.getHoursWorked(
      req.query as { page?: string; limit?: string },
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching HoursWorked", error });
  }
};

// Get a specific hours worked record by ID
export const getHoursWorkedById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const hoursWorked = await hoursWorkedService.getHoursWorkedById(id);
    if (hoursWorked) {
      return res.status(200).json(hoursWorked);
    }
    return res.status(404).json({ message: "HoursWorked entry not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching HoursWorked by ID", error });
  }
};

// Create a new hours worked record
export const createHoursWorked = async (req: Request, res: Response) => {
  try {
    const hoursWorked = await hoursWorkedService.createHoursWorked(req.body);
    return res.status(201).json(hoursWorked);
  } catch (error) {
    return res.status(500).json({ message: "Error creating HoursWorked", error });
  }
};

// Update an hours worked record by ID
export const updateHoursWorked = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedHoursWorked = await hoursWorkedService.updateHoursWorked(id, req.body);
    if (updatedHoursWorked) {
      return res.status(200).json(updatedHoursWorked);
    }
    return res.status(404).json({ message: "HoursWorked entry not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating HoursWorked", error });
  }
};

// Delete an hours worked record by ID
export const deleteHoursWorked = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await hoursWorkedService.deleteHoursWorked(Number(id));

    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).json({ message: "HoursWorked entry not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting HoursWorked", error });
  }
};

// Delete all hours worked records (bulk)
export const deleteAllHoursWorked = async (req: Request, res: Response) => {
  try {
    await hoursWorkedService.deleteAllHoursWorked();
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: "Error deleting all hours worked records", error });
  }
};
