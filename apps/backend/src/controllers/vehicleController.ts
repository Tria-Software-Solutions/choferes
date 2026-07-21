// Controller for handling HTTP requests related to vehicles
// Provides endpoints for CRUD operations and vehicle queries
import { Request, Response } from "express";
import { parseISO, isValid } from "date-fns";
import * as vehicleService from "../services/vehicleService";

// Get all vehicles (paginated)
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getVehicles(req.query as { page?: string; limit?: string });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Vehicles", error });
  }
};

// Get a vehicle by its ID
export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vehicle = await vehicleService.getVehicleById(id);
    if (vehicle) {
      return res.status(200).json(vehicle);
    }
    return res.status(404).json({ message: "Vehicle not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Vehicle", error });
  }
};

// Get vehicles by a specific date
export const getVehiclesByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const vehicles = await vehicleService.getVehiclesByDate(parsedDate);
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Vehicles by date", error });
  }
};

// Create a new vehicle
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = {
      ...req.body,
      parkingDate: req.body.parkingDate ? parseISO(req.body.parkingDate) : new Date(),
    };

    const newVehicle = await vehicleService.createVehicle(vehicleData);
    return res.status(201).json(newVehicle);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Vehicle", error });
  }
};

// Update a vehicle by its ID
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updateData = { ...req.body };

    if (req.body.parkingDate) {
      updateData.parkingDate = parseISO(req.body.parkingDate);
    }

    const updatedVehicle = await vehicleService.updateVehicle(id, updateData);
    if (updatedVehicle) {
      return res.status(200).json(updatedVehicle);
    }
    return res.status(404).json({ message: "Vehicle not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating Vehicle", error });
  }
};

// Delete a vehicle by its ID
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await vehicleService.deleteVehicle(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Vehicle not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Vehicle", error });
  }
};

// Delete all vehicles (bulk)
export const deleteAllVehicles = async (req: Request, res: Response) => {
  try {
    await vehicleService.deleteAllVehicles();
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: "Error deleting all vehicles", error });
  }
};
