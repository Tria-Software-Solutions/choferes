import express from "express";
import * as employeeController from "../controllers/employeeController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
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

router.get("/", authenticateToken, employeeQueryRules, validate, employeeController.getEmployees);
router.get("/:id", authenticateToken, idParam, validate, employeeController.getEmployeeById);
router.get(
  "/:id/vacation-accrual",
  authenticateToken,
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
