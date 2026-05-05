// Controller for handling HTTP requests related to user-role assignments
// Provides endpoints for managing user-role relationships
import { Request, Response } from "express";
import * as userRoleService from "../services/userRoleService";

// Get all user-role assignments
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const roles = await userRoleService.getUserRoles();
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching UserRoles", error });
  }
};

// Get user-role assignments by user ID
export const getUserRoleByUserId = async (req: Request, res: Response) => {
  try {
    const user = await userRoleService.getUserRoleByUserId(Number(req.params.userId));
    if (!user) {
      return res.status(404).json({ message: "UserRole not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching UserRole", error });
  }
};

// Get user-role assignments by role ID
export const getUserRoleByRoleId = async (req: Request, res: Response) => {
  try {
    const role = await userRoleService.getUserRoleByRoleId(Number(req.params.roleId));
    if (!role) {
      return res.status(404).json({ message: "UserRole not found" });
    }
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching UserRole", error });
  }
};

// Create a new user-role assignment
export const createUserRole = async (req: Request, res: Response) => {
  try {
    const userRole = await userRoleService.createUserRole(req.body);
    return res.status(201).json(userRole);
  } catch (error) {
    return res.status(400).json({ message: "Error assigning UserRole", error });
  }
};

// Update a user-role assignment by ID
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedUserRole = await userRoleService.updateUserRole(Number(id), req.body.roleId);
    if (updatedUserRole) {
      return res.status(200).json(updatedUserRole);
    }
    return res.status(404).json({ message: "UserRole not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating UserRole", error });
  }
};

// Delete a user-role assignment by ID
export const deleteUserRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await userRoleService.deleteUserRole(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "UserRole not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting UserRole", error });
  }
};
