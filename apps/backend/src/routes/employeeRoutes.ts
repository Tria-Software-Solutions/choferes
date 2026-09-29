import express from "express";
import * as employeeController from "../controllers/employeeController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAnyPermission, requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  employeeRules,
  employeeQueryRules,
  employeeUpdateRules,
  validate,
} from "../middleware/validation";
import {
  upload as multerUpload,
  uploadEmployeeAvatar,
  deleteEmployeeAvatar,
} from "../controllers/avatarController";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  // El tablero de Roles (solo lectura) necesita el listado de empleados.
  requireAnyPermission([PERMISSION_CODES.VIEW_EMPLOYEES, PERMISSION_CODES.VIEW_ROLES]),
  employeeQueryRules,
  validate,
  employeeController.getEmployees,
);
// Antes de "/:id" para que "hours-summary" no se interprete como un id.
router.get(
  "/hours-summary",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_EMPLOYEES),
  employeeController.getEmployeesBiweeklyHoursSummary,
);

// Enlazar/crear usuario para el empleado
router.post(
  "/:id/link-user",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEES),
  idParam,
  validate,
  employeeController.linkEmployeeToUser,
);

// Cuenta de acceso del empleado (usuario + roles) para el aviso de la ficha.
// Antes de "/:id" para que no se interprete como un id.
router.get(
  "/:id/access",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_EMPLOYEES),
  idParam,
  validate,
  employeeController.getEmployeeAccess,
);

// Asigna el rol por defecto cuando la cuenta del empleado quedó sin rol.
router.post(
  "/:id/assign-default-role",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEES),
  idParam,
  validate,
  employeeController.assignDefaultRoleToEmployeeUser,
);

router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_EMPLOYEES),
  idParam,
  validate,
  employeeController.getEmployeeById,
);
router.get(
  "/:id/vacation-accrual",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_VACATIONS),
  idParam,
  validate,
  employeeController.getVacationAccrual,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_EMPLOYEES),
  employeeRules,
  validate,
  employeeController.createEmployee,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEES),
  employeeUpdateRules,
  validate,
  employeeController.updateEmployee,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_EMPLOYEES),
  idParam,
  validate,
  employeeController.deleteEmployee,
);

// Employee avatar routes (base64 stored in DB, mirrors user avatar approach)
router.post(
  "/:id/avatar",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEES),
  multerUpload.single("avatar"),
  uploadEmployeeAvatar,
);
router.delete(
  "/:id/avatar",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEES),
  deleteEmployeeAvatar,
);

export default router;
