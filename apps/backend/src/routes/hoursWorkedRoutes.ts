import express from "express";
import * as hoursWorkedController from "../controllers/hoursWorkedController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  hoursWorkedRules,
  hoursWorkedUpdateRules,
  hoursWorkedQueryRules,
  recalculateRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_EMPLOYEE_HOURS),
  hoursWorkedQueryRules,
  validate,
  hoursWorkedController.getHoursWorked,
);
router.get(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_EMPLOYEE_HOURS),
  idParam,
  validate,
  hoursWorkedController.getHoursWorkedById,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEE_HOURS),
  hoursWorkedRules,
  validate,
  hoursWorkedController.createHoursWorked,
);
router.post(
  "/recalculate",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEE_HOURS),
  recalculateRules,
  validate,
  hoursWorkedController.recalculateSummaries,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEE_HOURS),
  hoursWorkedUpdateRules,
  validate,
  hoursWorkedController.updateHoursWorked,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_EMPLOYEE_HOURS),
  idParam,
  validate,
  hoursWorkedController.deleteHoursWorked,
);

export default router;
