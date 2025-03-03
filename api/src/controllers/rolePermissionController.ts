import { Request, Response } from "express";
import * as rolePermissionService from "../services/rolePermissionService";

export const getRolePermissions = async (req: Request, res: Response) => {
  const { roleId } = req.params;

  try {
    const permissions = await rolePermissionService.getRolePermissions(
      Number(roleId)
    );
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
  const { roleId, permissionId } = req.body;

  try {
    await rolePermissionService.deleteRolePermission(roleId, permissionId);
    res.status(200).json({ message: "RolePermission deleted" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting RolePermission", error });
  }
};
