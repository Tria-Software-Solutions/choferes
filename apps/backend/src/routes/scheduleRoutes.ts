import express from "express";
import * as scheduleController from "../controllers/scheduleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAnyPermission, requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  scheduleRules,
  scheduleUpdateRules,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  // El tablero de Roles (solo lectura) necesita el listado de horarios.
  requireAnyPermission([PERMISSION_CODES.VIEW_SCHEDULES, PERMISSION_CODES.VIEW_ROLES]),
  paginationRules,
  validate,
  scheduleController.getSchedules,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_SCHEDULES),
  idParam,
  validate,
  scheduleController.getScheduleById,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_SCHEDULES),
  scheduleRules,
  validate,
  scheduleController.createSchedule,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_SCHEDULES),
  scheduleUpdateRules,
  validate,
  scheduleController.updateSchedule,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_SCHEDULES),
  idParam,
  validate,
  scheduleController.deleteSchedule,
);

export default router;
