import { Request, Response } from "express";
import * as roleService from "../services/roleService";

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const role = await roleService.createRole(name);
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Role', error });
  }
};

export const getRoles = async (req: Request, res: Response) => {
    try {
      const roles = await roleService.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching Roles", error });
    }
  };

export const getRoleById = async (req: Request, res: Response) => {
    try {
      const role = await roleService.getRoleById(Number(req.params.id));
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Error fetching Role", error });
    }
  };

