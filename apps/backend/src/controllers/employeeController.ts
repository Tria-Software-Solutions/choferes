// Controller for handling HTTP requests related to employees
// Provides endpoints for CRUD operations on employees
import { Request, Response } from "express";
import * as employeeService from "../services/employeeService";
import * as vacationAccrualService from "../services/vacationAccrualService";
import {
  getCurrentBiweek,
  getEmployeesBiweeklyHours,
} from "../services/employeeHoursSummaryService";
import { ServiceError, isServiceError, sendServerError } from "../utils/errors";

// Get all employees (paginated)
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const result = await employeeService.getEmployees(
      req.query as { page?: string; limit?: string },
    );
    return res.status(200).json(result);
  } catch (error) {
    return sendServerError(res, "Error fetching Employees", error);
  }
};

// Get an employee by their ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const employee = await employeeService.getEmployeeById(id);
    if (employee) {
      return res.status(200).json(employee);
    }
    return res.status(404).json({ message: "Employee not found" });
  } catch (error) {
    return sendServerError(res, "Error fetching Employee", error);
  }
};

// Create a new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const newEmployee = await employeeService.createEmployee(req.body);
    return res.status(201).json(newEmployee);
  } catch (error) {
    return sendServerError(res, "Error creating Employee", error);
  }
};

// Update an employee by their ID
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedEmployee = await employeeService.updateEmployee(id, req.body);
    if (updatedEmployee) {
      return res.status(200).json(updatedEmployee);
    }
    return res.status(404).json({ message: "Employee not found" });
  } catch (error) {
    return sendServerError(res, "Error updating Employee", error);
  }
};

// Get the vacation accrual of an employee (Costa Rica labor law, prorated)
export const getVacationAccrual = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const accrual = await vacationAccrualService.getVacationAccrual(id);
    return res.status(200).json(accrual);
  } catch (error) {
    if (isServiceError(error)) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return sendServerError(res, "Error fetching vacation accrual", error);
  }
};

// Delete an employee by their ID
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await employeeService.deleteEmployee(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Employee not found" });
  } catch (error) {
    return sendServerError(res, "Error deleting Employee", error);
  }
};

// Horas de la quincena por empleado (tabla de Planilla). Sin parámetros devuelve la
// quincena actual; con ?biweek=&year= devuelve ese período.
export const getEmployeesBiweeklyHoursSummary = async (req: Request, res: Response) => {
  try {
    const current = getCurrentBiweek();
    const biweekNumber = req.query.biweek ? Number(req.query.biweek) : current.biweekNumber;
    const year = req.query.year ? Number(req.query.year) : current.year;

    if (!Number.isInteger(biweekNumber) || biweekNumber < 1 || biweekNumber > 24) {
      throw new ServiceError(400, "biweek debe estar entre 1 y 24");
    }
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new ServiceError(400, "year inválido");
    }

    const summaries = await getEmployeesBiweeklyHours(biweekNumber, year);
    return res.status(200).json({ biweekNumber, year, summaries });
  } catch (error) {
    if (isServiceError(error)) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return sendServerError(res, "Error fetching biweekly hours", error);
  }
};

// Enlaza el empleado a un usuario del sistema (o lo crea). Devuelve la contraseña
// temporal solo si el usuario es NUEVO (para que el admin la entregue).
export const linkEmployeeToUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await employeeService.linkEmployeeToUser(id);
    if (!result.created) {
      return res.status(200).json({
        message: "El empleado ya tiene acceso al sistema",
        userId: result.user.id,
        username: result.user.username,
        created: false,
      });
    }
    return res.status(201).json({
      message: "Acceso al sistema creado",
      userId: result.user.id,
      username: result.user.username,
      tempPassword: result.tempPassword,
      created: true,
    });
  } catch (error) {
    if (isServiceError(error)) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return sendServerError(res, "Error linking employee to user", error);
  }
};
