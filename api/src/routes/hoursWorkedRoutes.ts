import express from "express";
import * as hoursWorkedController from "../controllers/hoursWorkedController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, hoursWorkedController.getHoursWorked);
router.get("/:id", authenticateToken, hoursWorkedController.getHoursWorkedById);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  hoursWorkedController.createHoursWorked
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  hoursWorkedController.updateHoursWorked
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  hoursWorkedController.deleteHoursWorked
);

export default router;
