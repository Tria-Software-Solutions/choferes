import express from "express";
import * as hoursWorkedController from "../controllers/hoursWorkedController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  idParam,
  hoursWorkedRules,
  hoursWorkedUpdateRules,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, hoursWorkedController.getHoursWorked);
router.get("/:id", authenticateToken, idParam, validate, hoursWorkedController.getHoursWorkedById);
router.post(
  "/",
  authenticateToken,
  hoursWorkedRules,
  validate,
  hoursWorkedController.createHoursWorked,
);
router.put(
  "/:id",
  authenticateToken,
  hoursWorkedUpdateRules,
  validate,
  hoursWorkedController.updateHoursWorked,
);
router.delete("/bulk", authenticateToken, hoursWorkedController.deleteAllHoursWorked);
router.delete(
  "/:id",
  authenticateToken,
  idParam,
  validate,
  hoursWorkedController.deleteHoursWorked,
);

export default router;
