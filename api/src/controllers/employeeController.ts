import { Request, Response } from "express";
import * as employeeService from "../services/employeeService";

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getEmployees();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Employees", error });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const employee = await employeeService.getEmployeeById(id);
    if (employee) {
      res.status(200).json(employee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching Employee", error });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const newEmployee = await employeeService.createEmployee(req.body);
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: "Error creating Employee", error });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedEmployee = await employeeService.updateEmployee(id, req.body);
    if (updatedEmployee) {
      return res.status(200).json(updatedEmployee);
    } else {
      return res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating Employee", error });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await employeeService.deleteEmployee(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Employee", error });
  }
};
