import express from "express";
import * as vacationController from "../controllers/vacationController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  vacationRules,
  vacationUpdateRules,
  vacationQueryRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_VACATIONS),
  vacationQueryRules,
  validate,
  vacationController.getVacations,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_VACATIONS),
  idParam,
  validate,
  vacationController.getVacationById,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_VACATION),
  vacationRules,
  validate,
  vacationController.createVacation,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_VACATION),
  vacationUpdateRules,
  validate,
  vacationController.updateVacation,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_VACATION),
  idParam,
  validate,
  vacationController.deleteVacation,
);

export default router;
