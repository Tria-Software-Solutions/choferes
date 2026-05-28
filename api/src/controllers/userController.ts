// Controller for handling HTTP requests related to users
// Provides endpoints for authentication, user management, and permissions
import { Request, Response } from "express";
import * as userService from "../services/userService";

// Authenticate a user and return tokens and permissions
export const authenticateUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Credenciales incompletas",
        details: {
          identifier: !identifier ? "El usuario o email es requerido" : null,
          password: !password ? "La contraseña es requerida" : null,
        },
      });
    }

    const { user, accessToken, refreshToken } = await userService.authenticateUser(
      identifier,
      password,
      res,
    );

    const userPermissions =
      user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.name)) || [];

    const uniquePermissions = Array.from(new Set(userPermissions));

    return res.status(200).json({
      user,
      accessToken,
      refreshToken,
      userPermissions: uniquePermissions,
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "message" in error) {
      const errMsg = (error as { message: string }).message;
      if (errMsg === "User not found") {
        return res.status(401).json({
          message: "Usuario no encontrado",
          details: "El usuario o email proporcionado no existe en el sistema",
        });
      }
      if (errMsg === "User is inactive") {
        return res.status(401).json({
          message: "Usuario desactivado",
          details: "Tu cuenta ha sido desactivada. Contacta al administrador",
        });
      }
      if (errMsg === "Incorrect password") {
        return res.status(401).json({
          message: "Contraseña incorrecta",
          details: "La contraseña proporcionada no es correcta",
        });
      }
      if (errMsg === "Incorrect password and temporary password") {
        return res.status(401).json({
          message: "Credenciales incorrectas",
          details: "Ni la contraseña principal ni la contraseña temporal son correctas",
        });
      }
    }
    console.error(
      "[authenticateUser] Unhandled error:",
      error instanceof Error ? error.message : error,
    );
    return res.status(500).json({
      message: "Error interno del servidor",
      details: "Ocurrió un error inesperado durante la autenticación",
    });
  }
};

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Users", error });
  }
};

// Get a user by their ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching User", error });
  }
};

// Get a user by their email
export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching User", error });
  }
};

// Get a user by their username
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

// Get permissions for a user by their ID
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserPermissions(parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({ message: "User Permissions not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching User Permissions", error });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: "Error registering User", error });
  }
};

// Update a user by their ID
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedUser = await userService.updateUser(id, req.body);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};

// Update a user's status (active/inactive) by their ID
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedUser = await userService.updateUserStatus(id, req.body.isActive);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};

// Update a user's password by their ID
export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedUser = await userService.updateUserPassword(id, req.body.password);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};

// Update a user's temporary password by their ID
export const updateUserTemporalPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedUser = await userService.updateUserTemporalPassword(id, req.body.temporalPassword);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};

// Delete a user by their ID
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await userService.deleteUser(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting User", error });
  }
};
