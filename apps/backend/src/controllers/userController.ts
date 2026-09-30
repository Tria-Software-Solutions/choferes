// Controller for handling HTTP requests related to users
// Provides endpoints for authentication, user management, and permissions
import { Request, Response } from "express";
import * as userService from "../services/userService";
import { getUserId } from "../middleware/authorize";
import { sendServerError } from "../utils/errors";

// Authenticate a user and return tokens and permissions
export const authenticateUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (
      !identifier ||
      !password ||
      typeof identifier !== "string" ||
      typeof password !== "string"
    ) {
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
      user.roles?.flatMap((role) => role.permissions?.map((permission) => permission.code)) || [];

    const uniquePermissions = Array.from(new Set(userPermissions));

    return res.status(200).json({
      user,
      accessToken,
      refreshToken,
      userPermissions: uniquePermissions,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "";
    if (errMsg === userService.AUTH_ERRORS.INVALID_CREDENTIALS) {
      return res.status(401).json({
        message: "Credenciales incorrectas",
        details: "El usuario o la contraseña no son correctos",
      });
    }
    if (errMsg === userService.AUTH_ERRORS.INACTIVE) {
      return res.status(403).json({
        message: "Usuario desactivado",
        details: "Tu cuenta ha sido desactivada. Contacta al administrador",
      });
    }
    // eslint-disable-next-line no-console
    console.error("[authenticateUser] Unhandled error:", errMsg || error);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: "Ocurrió un error inesperado durante la autenticación",
    });
  }
};

// Get all users (paginated)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUsers(req.query as { page?: string; limit?: string });
    return res.status(200).json(result);
  } catch (error) {
    return sendServerError(res, "Error fetching Users", error);
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
    return sendServerError(res, "Error fetching User", error);
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
    return sendServerError(res, "Error fetching User", error);
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
    return sendServerError(res, "Error fetching User", error);
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
    return sendServerError(res, "Error fetching User Permissions", error);
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    return sendServerError(res, "Error registering User", error);
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
    return sendServerError(res, "Error updating User", error);
  }
};

// Update a user's status (active/inactive) by their ID
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (id === getUserId(req) && req.body.isActive === false) {
      return res.status(400).json({ message: "No puedes desactivar tu propia cuenta" });
    }
    const updatedUser = await userService.updateUserStatus(id, req.body.isActive);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return sendServerError(res, "Error updating User", error);
  }
};

// Update a user's password by their ID. Changing your own password requires
// the current one, so a hijacked session can't silently take over the account.
// (Responds 400, not 401: a 401 would make the client end the session.)
export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (id === getUserId(req)) {
      const { currentPassword } = req.body as { currentPassword?: unknown };
      if (typeof currentPassword !== "string" || currentPassword.length === 0) {
        return res.status(400).json({ message: "La contraseña actual es requerida" });
      }
      if (!(await userService.verifyUserPassword(id, currentPassword))) {
        return res.status(400).json({ message: "La contraseña actual no es correcta" });
      }
    }
    const updatedUser = await userService.updateUserPassword(id, req.body.password);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return sendServerError(res, "Error updating User", error);
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
    return sendServerError(res, "Error updating User", error);
  }
};

// Update a user's settings by their ID (merge with existing settings)
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { settings } = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ message: "Settings object is required" });
    }

    const updatedUser = await userService.updateUserSettings(id, settings);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return sendServerError(res, "Error updating user settings", error);
  }
};

// Delete a user by their ID
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (id === getUserId(req)) {
      return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
    }
    const deleted = await userService.deleteUser(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return sendServerError(res, "Error deleting User", error);
  }
};
