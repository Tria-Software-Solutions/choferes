// Controller for handling HTTP requests related to role-permission assignments
// Provides endpoints for managing role-permission relationships
import { Request, Response } from "express";
import * as rolePermissionService from "../services/rolePermissionService";
import * as accessGrantService from "../services/accessGrantService";
import type { AuthenticatedRequest } from "../middleware/authorize";
import { sendServerError, sendError } from "../utils/errors";

// Get all role-permission assignments
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await rolePermissionService.getRolePermissions();
    return res.status(200).json(permissions);
  } catch (error) {
    return sendServerError(res, "Error fetching RolePermissions", error);
  }
};

// Create a new role-permission assignment
export const createRolePermission = async (req: Request, res: Response) => {
  try {
    const actor = (req as AuthenticatedRequest).user;
    const roleId = Number(req.body?.roleId);
    const permissionId = Number(req.body?.permissionId);
    if (!actor) return res.status(401).json({ message: "Unauthorized" });
    if (!Number.isInteger(roleId) || !Number.isInteger(permissionId)) {
      return res.status(400).json({ message: "roleId y permissionId deben ser enteros" });
    }

    const denial = await accessGrantService.checkPermissionGrant(actor, roleId, [permissionId]);
    if (denial) return res.status(denial.status).json({ message: denial.message });

    const rolePermission = await rolePermissionService.createRolePermission({
      roleId,
      permissionId,
    } as never);
    return res.status(201).json(rolePermission);
  } catch (error) {
    return sendError(res, 400, "Error assigning RolePermission", error);
  }
};

// Update permissions for a specific role
export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const actor = (req as AuthenticatedRequest).user;
    const roleId = parseInt(req.params.id, 10);
    const { permissionIds } = req.body;

    if (!actor) return res.status(401).json({ message: "Unauthorized" });
    if (
      !Number.isInteger(roleId) ||
      !Array.isArray(permissionIds) ||
      !permissionIds.every((permissionId) => Number.isInteger(permissionId))
    ) {
      return res.status(400).json({ message: "Permission Ids must be an array of integers" });
    }

    const denial = await accessGrantService.checkPermissionGrant(actor, roleId, permissionIds);
    if (denial) return res.status(denial.status).json({ message: denial.message });

    const updatedRolePermissions = await rolePermissionService.updateRolePermission(
      roleId,
      permissionIds,
    );

    if (updatedRolePermissions) {
      return res.status(200).json(updatedRolePermissions);
    }
    return res.status(404).json({ message: "Role not found or no permissions updated" });
  } catch (error) {
    return sendServerError(res, "Error updating role permissions", error);
  }
};

// Delete a role-permission assignment by ID
export const deleteRolePermission = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await rolePermissionService.deleteRolePermission(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "RolePermission not found" });
  } catch (error) {
    return sendServerError(res, "Error deleting RolePermission", error);
  }
};

// Get permissions for a specific role
export const getRolePermissionsByRoleId = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.roleId, 10);
    if (Number.isNaN(roleId)) {
      return res.status(400).json({ message: "Invalid roleId" });
    }
    const permissions = await rolePermissionService.getRolePermissionsByRoleId(roleId);
    return res.status(200).json(permissions);
  } catch (error) {
    return sendServerError(res, "Error fetching permissions for role", error);
  }
};
