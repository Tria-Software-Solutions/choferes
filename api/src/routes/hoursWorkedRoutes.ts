import express from "express";
import * as hoursWorkedController from "../controllers/hoursWorkedController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, hoursWorkedController.getHoursWorked);
router.get("/:id", authenticateToken, hoursWorkedController.getHoursWorkedById);
router.post(
  "/",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE, Roles.SUPERVISOR]),
  hoursWorkedController.createHoursWorked
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE, Roles.SUPERVISOR]),
  hoursWorkedController.updateHoursWorked
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE, Roles.SUPERVISOR]),
  hoursWorkedController.deleteHoursWorked
);

export default router;
