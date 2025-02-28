import { Request, Response } from "express";
import * as vehicleService from "../services/vehicleService";
import { parseISO, isValid } from "date-fns";

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const newVehicle = await vehicleService.createVehicle(req.body);
    return res.status(201).json(newVehicle);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Vehicle", error });
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
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
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    const createdAt = parseISO(date as string);
    if (!isValid(createdAt)) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    const vehicles = await vehicleService.getVehiclesByDate(createdAt);
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Vehicles", error });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedVehicle = await vehicleService.updateVehicle(id, req.body);
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
