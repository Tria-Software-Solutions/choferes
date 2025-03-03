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
  const { userId, roleId } = req.body;

  try {
    await userRoleService.deleteUserRole(userId, roleId);
    res.status(200).json({ message: "UserRole deleted" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting UserRole", error });
  }
};
