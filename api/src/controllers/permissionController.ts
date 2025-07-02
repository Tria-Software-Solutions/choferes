import { Request, Response } from "express";
import * as permissionService from "../services/permissionService";

// Get all permissions
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getPermissions();
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permissions", error });
  }
};

// Get a permission by its ID
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.getPermissionById(Number(req.params.id));
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }
    return res.status(200).json(permission);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permission", error });
  }
};

// Get permissions by an array of names
export const getPermissionsByNames = async (req: Request, res: Response) => {
  try {
    const decodedPermissionsNames = decodeURIComponent(req.params.names);
    const permissionsNamesArray = decodedPermissionsNames.split(",").map((name) => name.trim());
    if (permissionsNamesArray.length === 0) {
      return res.status(400).json({ error: "Invalid permissions array" });
    }
    const permissions = await permissionService.getPermissionsByNames(permissionsNamesArray);
    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ error: "Permissions not found" });
    }
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permissions", error });
  }
};

// Create a new permission
export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const permission = await permissionService.createPermission(name);
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ message: "Error creating Permission", error });
  }
};

// Delete a permission by its ID
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await permissionService.deletePermission(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Permission not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Permission", error });
  }
};
