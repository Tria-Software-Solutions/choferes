import { Request, Response } from "express";
import * as rolePermissionService from "../services/rolePermissionService";

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await rolePermissionService.getRolePermissions();
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(400).json({ message: "Error fetching RolePermissions", error });
  }
};

export const createRolePermission = async (req: Request, res: Response) => {
  try {
    const rolePermission = await rolePermissionService.createRolePermission(
      req.body
    );
    return res.status(201).json(rolePermission);
  } catch (error) {
    return res.status(400).json({ message: "Error assigning RolePermission", error });
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ message: "Permission Ids must be an array" });
    }

    const updatedRolePermissions = await rolePermissionService.updateRolePermission(roleId, permissionIds);

    if (updatedRolePermissions) {
      return res.status(200).json(updatedRolePermissions);
    } else {
      return res.status(404).json({ message: "Role not found or no permissions updated" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating role permissions", error });
  }
};

export const deleteRolePermission = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await rolePermissionService.deleteRolePermission(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "RolePermission not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting RolePermission", error });
  }
};
