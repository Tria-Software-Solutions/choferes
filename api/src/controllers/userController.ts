import { Request, Response } from "express";
import * as userService from "../services/userService";

export const authenticateUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ 
        message: "Credenciales incompletas",
        details: {
          identifier: !identifier ? "El usuario o email es requerido" : null,
          password: !password ? "La contraseña es requerida" : null
        }
      });
    }

    const { user, accessToken, refreshToken } =
      await userService.authenticateUser(identifier, password, res);
    return res.status(200).json({ user, accessToken, refreshToken });
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(401).json({ 
        message: "Usuario no encontrado",
        details: "El usuario o email proporcionado no existe en el sistema"
      });
    }
    
    if (error.message === "User is inactive") {
      return res.status(401).json({ 
        message: "Usuario desactivado",
        details: "Tu cuenta ha sido desactivada. Contacta al administrador"
      });
    }
    
    if (error.message === "Incorrect password") {
      return res.status(401).json({ 
        message: "Contraseña incorrecta",
        details: "La contraseña proporcionada no es correcta"
      });
    }
    
    if (error.message === "Incorrect password and temporary password") {
      return res.status(401).json({ 
        message: "Credenciales incorrectas",
        details: "Ni la contraseña principal ni la contraseña temporal son correctas"
      });
    }

    console.error("Error en autenticación:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor",
      details: "Ocurrió un error inesperado durante la autenticación"
    });
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
    return res
      .status(500)
      .json({ message: "Error fetching User Permissions", error });
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

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userService.updateUserStatus(
      id,
      req.body.isActive
    );
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};

export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userService.updateUserPassword(
      id,
      req.body.password
    );
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};

export const updateUserTemporalPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userService.updateUserTemporalPassword(
      id,
      req.body.temporalPassword
    );
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
