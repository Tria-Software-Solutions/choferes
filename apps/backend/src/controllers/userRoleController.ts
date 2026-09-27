// Controller for handling HTTP requests related to user-role assignments
// Provides endpoints for managing user-role relationships
import { Request, Response } from "express";
import * as userRoleService from "../services/userRoleService";
import * as accessGrantService from "../services/accessGrantService";
import type { AuthenticatedRequest } from "../middleware/authorize";
import { sendServerError, sendError } from "../utils/errors";

// Get all user-role assignments
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const roles = await userRoleService.getUserRoles();
    return res.status(200).json(roles);
  } catch (error) {
    return sendServerError(res, "Error fetching UserRoles", error);
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
    return sendServerError(res, "Error fetching UserRole", error);
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
    return sendServerError(res, "Error fetching UserRole", error);
  }
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Create a new user-role assignment
export const createUserRole = async (req: Request, res: Response) => {
  try {
    const actor = (req as AuthenticatedRequest).user;
    const userId = toPositiveInt(req.body?.userId);
    const roleId = toPositiveInt(req.body?.roleId);
    if (!actor) return res.status(401).json({ message: "Unauthorized" });
    if (!userId || !roleId) {
      return res.status(400).json({ message: "userId y roleId deben ser enteros positivos" });
    }

    const denial = await accessGrantService.checkRoleAssignment(actor, userId, roleId);
    if (denial) return res.status(denial.status).json({ message: denial.message });

    const userRole = await userRoleService.createUserRole({ userId, roleId } as never);
    return res.status(201).json(userRole);
  } catch (error) {
    return sendError(res, 400, "Error assigning UserRole", error);
  }
};

// Update the role of a user (the :id param is the user id)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const actor = (req as AuthenticatedRequest).user;
    const userId = toPositiveInt(req.params.id);
    const roleId = toPositiveInt(req.body?.roleId);
    if (!actor) return res.status(401).json({ message: "Unauthorized" });
    if (!userId || !roleId) {
      return res.status(400).json({ message: "userId y roleId deben ser enteros positivos" });
    }

    const denial = await accessGrantService.checkRoleAssignment(actor, userId, roleId);
    if (denial) return res.status(denial.status).json({ message: denial.message });

    const updatedUserRole = await userRoleService.updateUserRole(userId, roleId);
    if (updatedUserRole) {
      return res.status(200).json(updatedUserRole);
    }
    return res.status(404).json({ message: "UserRole not found" });
  } catch (error) {
    return sendServerError(res, "Error updating UserRole", error);
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
    return sendServerError(res, "Error deleting UserRole", error);
  }
};
