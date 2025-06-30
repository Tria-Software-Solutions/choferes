import { Request, Response } from "express";
import * as hoursWorkedService from "../services/hoursWorkedService";

export const getHoursWorked = async (req: Request, res: Response) => {
  try {
    const hoursWorked = await hoursWorkedService.getHoursWorked();
    return res.status(200).json(hoursWorked);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching HoursWorked", error });
  }
};

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

export const createHoursWorked = async (req: Request, res: Response) => {
  try {
    const hoursWorked = await hoursWorkedService.createHoursWorked(req.body);
    return res.status(201).json(hoursWorked);
  } catch (error) {
    return res.status(500).json({ message: "Error creating HoursWorked", error });
  }
};

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
