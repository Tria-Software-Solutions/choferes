import express from "express";
import * as meController from "../controllers/meController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import { myVacationRules, validate } from "../middleware/validation";

const router = express.Router();

// Autoservicio: exige el permiso correspondiente (concedido a todos los roles
// base). El servicio deriva el empleado de users.employeeId, así que nunca se
// acepta un id de empleado desde el cliente.
router.get(
  "/overview",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_MY_PANEL),
  meController.getMyOverview,
);
router.post(
  "/vacations",
  authenticateToken,
  requirePermission(PERMISSION_CODES.REQUEST_VACATION),
  myVacationRules,
  validate,
  meController.createMyVacation,
);

export default router;
