// Controller for handling HTTP requests related to permissions.
// Read-only: the permission catalog is code-owned, so there is no runtime CRUD.
import { Request, Response } from "express";
import * as permissionService from "../services/permissionService";
import { sendServerError } from "../utils/errors";

// Get all permissions (paginated)
export const getPermissions = async (req: Request, res: Response) => {
  try {
    const result = await permissionService.getPermissions(
      req.query as { page?: string; limit?: string },
    );
    return res.status(200).json(result);
  } catch (error) {
    return sendServerError(res, "Error fetching Permissions", error);
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
    return sendServerError(res, "Error fetching Permission", error);
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
    return sendServerError(res, "Error fetching Permissions", error);
  }
};
