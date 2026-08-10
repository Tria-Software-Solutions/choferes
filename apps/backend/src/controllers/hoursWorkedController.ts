// Controller for handling HTTP requests related to hours worked records
// Provides endpoints for CRUD operations on hours worked
import { Request, Response } from "express";
import * as hoursWorkedService from "../services/hoursWorkedService";
import * as summaryRecalculationService from "../services/summaryRecalculationService";
import { Employee } from "../models/Employee";

// Get all hours worked records (paginated, optionally filtered by date range)
export const getHoursWorked = async (req: Request, res: Response) => {
  try {
    const result = await hoursWorkedService.getHoursWorked(
      req.query as { page?: string; limit?: string; dateFrom?: string; dateTo?: string },
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

// Recalculate weekly / biweekly / monthly summaries from hours_worked (source
// of truth). With an employeeId it recomputes that employee's periods (a
// specific one if `date` is given, otherwise all of them). Without arguments it
// recomputes the current month's periods for every employee with hours.
export const recalculateSummaries = async (req: Request, res: Response) => {
  try {
    const { employeeId, date } = req.body as { employeeId?: number; date?: string };

    if (employeeId !== undefined) {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const counts = await summaryRecalculationService.recalculateSummariesForEmployee(
        employeeId,
        date,
      );
      return res.status(200).json({
        message: "Summaries recalculated",
        employeeId,
        recalculated: counts,
      });
    }

    const counts = await summaryRecalculationService.recalculateCurrentPeriodsForAllEmployees();
    return res.status(200).json({
      message: "Current period summaries recalculated",
      recalculated: counts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error recalculating summaries", error });
  }
};
