// Controller for handling HTTP requests related to schedules
// Provides endpoints for CRUD operations on schedules
import { Request, Response } from "express";
import * as scheduleService from "../services/scheduleService";

// Get all schedules (paginated)
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const result = await scheduleService.getSchedules(
      req.query as { page?: string; limit?: string },
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Schedules", error });
  }
};

// Get a schedule by its ID
export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schedule = await scheduleService.getScheduleById(id);
    if (schedule) {
      return res.status(200).json(schedule);
    }
    return res.status(404).json({ message: "Schedule not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Schedule", error });
  }
};

// Create a new schedule
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const newSchedule = await scheduleService.createSchedule(req.body);
    return res.status(201).json(newSchedule);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Schedule", error });
  }
};

// Update a schedule by its ID
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedSchedule = await scheduleService.updateSchedule(id, req.body);
    if (updatedSchedule) {
      return res.status(200).json(updatedSchedule);
    }
    return res.status(404).json({ message: "Schedule not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating Schedule", error });
  }
};

// Delete a schedule by its ID
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scheduleService.deleteSchedule(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Schedule not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Schedule", error });
  }
};
