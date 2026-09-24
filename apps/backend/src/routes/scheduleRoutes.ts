import express from "express";
import * as scheduleController from "../controllers/scheduleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSIONS } from "../constants/permissions";
import {
  idParam,
  scheduleRules,
  scheduleUpdateRules,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, scheduleController.getSchedules);
router.get("/:id", authenticateToken, idParam, validate, scheduleController.getScheduleById);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.CREATE_SCHEDULE),
  scheduleRules,
  validate,
  scheduleController.createSchedule,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_SCHEDULE),
  scheduleUpdateRules,
  validate,
  scheduleController.updateSchedule,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.DELETE_SCHEDULE),
  idParam,
  validate,
  scheduleController.deleteSchedule,
);

export default router;
