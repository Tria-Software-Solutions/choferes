import express from "express";
import { MANAGEMENT_ROLE_NAMES, PERMISSION_CODES } from "@choferes/shared";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission, requireRole } from "../middleware/authorize";
import {
  idParam,
  roleRules,
  roleUpdateRules,
  roleNameParam,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

// La API de roles es exclusiva de Gerencia/Administrativo: el permiso por sí
// solo no habilita la administración. Coincide con lo que hace la UI.
const requireManagementRole = requireRole([...MANAGEMENT_ROLE_NAMES]);

router.get(
  "/",
  authenticateToken,
  requireManagementRole,
  paginationRules,
  validate,
  roleController.getRoles,
);
router.get(
  "/:id",
  authenticateToken,
  requireManagementRole,
  idParam,
  validate,
  roleController.getRoleById,
);
router.get(
  "/name/:name",
  authenticateToken,
  requireManagementRole,
  roleNameParam,
  validate,
  roleController.getRoleByName,
);
router.post(
  "/",
  authenticateToken,
  requireManagementRole,
  requirePermission(PERMISSION_CODES.CREATE_ROLE),
  roleRules,
  validate,
  roleController.createRole,
);
router.put(
  "/:id",
  authenticateToken,
  requireManagementRole,
  requirePermission(PERMISSION_CODES.EDIT_ROLE),
  roleUpdateRules,
  validate,
  roleController.updateRole,
);
router.delete(
  "/:id",
  authenticateToken,
  requireManagementRole,
  requirePermission(PERMISSION_CODES.DELETE_ROLE),
  idParam,
  validate,
  roleController.deleteRole,
);

export default router;
