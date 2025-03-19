import { Request, Response } from "express";
import * as userService from "../services/userService";

export const authenticateUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const { user, accessToken, refreshToken } =
      await userService.authenticateUser(username, password, res);
      return res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    return res.status(401).json({ message: "Error login User", error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Users", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching User", error });
  }
};

export const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching User", error });
  }
};

export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserPermissions(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User Permissions not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching User Permissions", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: "Error registering User", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userService.updateUser(id, req.body);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await userService.deleteUser(id);
    if (deleted) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting User", error });
  }
};
