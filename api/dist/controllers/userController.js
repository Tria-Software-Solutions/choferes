"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser =
  exports.updateUserTemporalPassword =
  exports.updateUserPassword =
  exports.updateUserStatus =
  exports.updateUser =
  exports.createUser =
  exports.getUserPermissions =
  exports.getUserByUsername =
  exports.getUserByEmail =
  exports.getUserById =
  exports.getUsers =
  exports.authenticateUser =
    void 0;
const userService = __importStar(require("../services/userService"));
const authenticateUser = async (req, res) => {
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
    return res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(401).json({
        message: "Usuario no encontrado",
        details: "El usuario o email proporcionado no existe en el sistema",
      });
    }
    if (error.message === "User is inactive") {
      return res.status(401).json({
        message: "Usuario desactivado",
        details: "Tu cuenta ha sido desactivada. Contacta al administrador",
      });
    }
    if (error.message === "Incorrect password") {
      return res.status(401).json({
        message: "Contraseña incorrecta",
        details: "La contraseña proporcionada no es correcta",
      });
    }
    if (error.message === "Incorrect password and temporary password") {
      return res.status(401).json({
        message: "Credenciales incorrectas",
        details: "Ni la contraseña principal ni la contraseña temporal son correctas",
      });
    }
    console.error("Error en autenticación:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      details: "Ocurrió un error inesperado durante la autenticación",
    });
  }
};
exports.authenticateUser = authenticateUser;
const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Users", error });
  }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
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
exports.getUserById = getUserById;
const getUserByEmail = async (req, res) => {
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
exports.getUserByEmail = getUserByEmail;
const getUserByUsername = async (req, res) => {
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
exports.getUserByUsername = getUserByUsername;
const getUserPermissions = async (req, res) => {
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
exports.getUserPermissions = getUserPermissions;
const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: "Error registering User", error });
  }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
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
exports.updateUser = updateUser;
const updateUserStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userService.updateUserStatus(id, req.body.isActive);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};
exports.updateUserStatus = updateUserStatus;
const updateUserPassword = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userService.updateUserPassword(id, req.body.password);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};
exports.updateUserPassword = updateUserPassword;
const updateUserTemporalPassword = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updatedUser = await userService.updateUserTemporalPassword(id, req.body.temporalPassword);
    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error updating User", error });
  }
};
exports.updateUserTemporalPassword = updateUserTemporalPassword;
const deleteUser = async (req, res) => {
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
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map
