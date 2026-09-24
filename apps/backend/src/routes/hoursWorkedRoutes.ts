import express from "express";
import * as hoursWorkedController from "../controllers/hoursWorkedController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSIONS } from "../constants/permissions";
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
  hoursWorkedQueryRules,
  validate,
  hoursWorkedController.getHoursWorked,
);
router.get("/:id", authenticateToken, idParam, validate, hoursWorkedController.getHoursWorkedById);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_EMPLOYEE_ROLES),
  hoursWorkedRules,
  validate,
  hoursWorkedController.createHoursWorked,
);
router.post(
  "/recalculate",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_EMPLOYEE_ROLES),
  recalculateRules,
  validate,
  hoursWorkedController.recalculateSummaries,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_EMPLOYEE_ROLES),
  hoursWorkedUpdateRules,
  validate,
  hoursWorkedController.updateHoursWorked,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_EMPLOYEE_ROLES),
  idParam,
  validate,
  hoursWorkedController.deleteHoursWorked,
);

export default router;
