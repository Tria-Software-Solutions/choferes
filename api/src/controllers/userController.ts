import { Request, Response } from "express";
import * as userService from "../services/userService";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, username, password } = req.body;
    const user = await userService.createUser(
      firstName,
      lastName,
      email,
      username,
      password
    );
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error registering User", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await userService.authenticateUser(
      username,
      password
    );
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ message: "Error login User", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Users", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not fouund" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching User", error });
  }
};
