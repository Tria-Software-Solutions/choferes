import { Request, Response } from "express";
import * as employeeService from "../services/employeeService";

// Get all employees
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getEmployees();
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Employees", error });
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
    return res.status(500).json({ message: "Error fetching Employee", error });
  }
};

// Create a new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const newEmployee = await employeeService.createEmployee(req.body);
    return res.status(201).json(newEmployee);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Employee", error });
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
    return res.status(500).json({ message: "Error updating Employee", error });
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
    return res.status(500).json({ message: "Error deleting Employee", error });
  }
};
