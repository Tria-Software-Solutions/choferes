import { Request, Response } from "express";
import * as userRoleService from "../services/userRoleService";

export const getUserRoles = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const roles = await userRoleService.getUserRoles(Number(userId));
    res.status(200).json(roles);
  } catch (error) {
    res.status(400).json({ message: "Error fetching UserRole", error });
  }
};

export const createUserRole = async (req: Request, res: Response) => {
  try {
    const userRole = await userRoleService.createUserRole(req.body);
    res.status(201).json(userRole);
  } catch (error) {
    res.status(400).json({ message: "Error assigning UserRole", error });
  }
};

export const deleteUserRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await userRoleService.deleteUserRole(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "UserRole not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting UserRole", error });
  }
};
