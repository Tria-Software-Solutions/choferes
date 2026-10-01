import express from "express";
import * as licenseRequestController from "../controllers/licenseRequestController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  licenseRequestQueryRules,
  licenseRequestRejectRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

// Revisión de las solicitudes que envían los empleados desde su expediente.
// Las resuelve quien administra licencias: aprobar aplica el cambio a la
// licencia real y rechazar solo la cierra.
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_LICENSE),
  licenseRequestQueryRules,
  validate,
  licenseRequestController.getLicenseRequests,
);
router.post(
  "/:id/approve",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_LICENSE),
  idParam,
  validate,
  licenseRequestController.approveLicenseRequest,
);
router.post(
  "/:id/reject",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_LICENSE),
  licenseRequestRejectRules,
  validate,
  licenseRequestController.rejectLicenseRequest,
);

export default router;
