import { Request, Response } from "express";
import * as roleService from "../services/roleService";

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getRoles();
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Roles", error });
  }
};

// Get a role by its ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await roleService.getRoleById(Number(req.params.id));
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Role", error });
  }
};

// Get a role by its name
export const getRoleByName = async (req: Request, res: Response) => {
  try {
    const role = await roleService.getRoleByName(req.params.name);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Role", error });
  }
};

// Create a new role
export const createRole = async (req: Request, res: Response) => {
  try {
    const newRole = await roleService.createRole(req.body);
    return res.status(201).json(newRole);
  } catch (error) {
    return res.status(500).json({ message: "Error creating Role", error });
  }
};

// Update a role by its ID
export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedRole = await roleService.updateRole(id, req.body);
    if (updatedRole) {
      return res.status(200).json(updatedRole);
    }
    return res.status(404).json({ message: "Role not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating Role", error });
  }
};

// Delete a role by its ID
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await roleService.deleteRole(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Role not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Role", error });
  }
};
