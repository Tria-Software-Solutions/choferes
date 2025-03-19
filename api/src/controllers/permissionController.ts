import { Request, Response } from "express";
import * as permissionService from "../services/permissionService";

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getPermissions();
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permissions", error });
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.getPermissionById(
      Number(req.params.id)
    );
    if (!permission)
      return res.status(404).json({ error: "Permiso no encontrado" });
    return res.status(200).json(permission);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Permission", error });
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const permission = await permissionService.createPermission(name);
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ message: "Error creating Permission", error });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await permissionService.deletePermission(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "Permission not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting Permission", error });
  }
};
