import express from "express";
import { PERMISSION_CODES } from "@choferes/shared";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import {
  idParam,
  roleRules,
  roleUpdateRules,
  roleNameParam,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

// La administración de roles se controla con permisos (ver/crear/editar/eliminar).
// Quien solo tiene `roles:view` (p. ej. Supervisor) entra en modo lectura; la
// UI además oculta la edición. No se exige rol de gestión: el permiso basta.

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_ROLES),
  paginationRules,
  validate,
  roleController.getRoles,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_ROLES),
  idParam,
  validate,
  roleController.getRoleById,
);
router.get(
  "/name/:name",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_ROLES),
  roleNameParam,
  validate,
  roleController.getRoleByName,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_ROLE),
  roleRules,
  validate,
  roleController.createRole,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_ROLE),
  roleUpdateRules,
  validate,
  roleController.updateRole,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_ROLE),
  idParam,
  validate,
  roleController.deleteRole,
);

export default router;
