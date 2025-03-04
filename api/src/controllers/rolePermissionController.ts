import { Request, Response } from "express";
import * as rolePermissionService from "../services/rolePermissionService";

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await rolePermissionService.getRolePermissions();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(400).json({ message: "Error fetching RolePermission", error });
  }
};

export const createRolePermission = async (req: Request, res: Response) => {
  try {
    const rolePermission = await rolePermissionService.createRolePermission(
      req.body
    );
    res.status(201).json(rolePermission);
  } catch (error) {
    res.status(400).json({ message: "Error assigning RolePermission", error });
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
