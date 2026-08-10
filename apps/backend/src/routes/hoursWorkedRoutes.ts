import express from "express";
import * as hoursWorkedController from "../controllers/hoursWorkedController";
import { authenticateToken } from "../middleware/authMiddleware";
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
  hoursWorkedRules,
  validate,
  hoursWorkedController.createHoursWorked,
);
router.post(
  "/recalculate",
  authenticateToken,
  recalculateRules,
  validate,
  hoursWorkedController.recalculateSummaries,
);
router.put(
  "/:id",
  authenticateToken,
  hoursWorkedUpdateRules,
  validate,
  hoursWorkedController.updateHoursWorked,
);
router.delete(
  "/:id",
  authenticateToken,
  idParam,
  validate,
  hoursWorkedController.deleteHoursWorked,
);

export default router;
