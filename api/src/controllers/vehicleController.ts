import { Request, Response } from "express";
import * as vehicleService from "../services/vehicleService";
import { parseISO, isValid } from "date-fns";

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getVehicles();
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Vehicles", error });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const vehicle = await vehicleService.getVehicleById(id);
    if (vehicle) {
      return res.status(200).json(vehicle);
    } else {
      return res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Vehicle", error });
  }
};

export const getVehiclesByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
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

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = {
      ...req.body,
      parkingDate: req.body.parkingDate ? parseISO(req.body.parkingDate) : new Date()
    };
    
    const newVehicle = await vehicleService.createVehicle(vehicleData);
    return res.status(201).json(newVehicle);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Vehicle", error });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = { ...req.body };
    
    if (req.body.parkingDate) {
      updateData.parkingDate = parseISO(req.body.parkingDate);
    }
    
    const updatedVehicle = await vehicleService.updateVehicle(id, updateData);
    if (updatedVehicle) {
      return res.status(200).json(updatedVehicle);
    } else {
      return res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating Vehicle", error });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await vehicleService.deleteVehicle(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Vehicle", error });
  }
};
