import { Request, Response } from "express";
import * as permissionService from "../services/permissionService";

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const permission = await permissionService.createPermission(name);
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Permission', error });
  }
};

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getPermissions();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Permissions", error });
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const permission = await permissionService.getPermissionById(Number(req.params.id));
    if (!permission) return res.status(404).json({ error: "Permiso no encontrado" });
    res.json(permission);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Permission", error });
  }
};
