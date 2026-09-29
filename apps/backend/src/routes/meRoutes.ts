import express from "express";
import * as meController from "../controllers/meController";
import { authenticateToken } from "../middleware/authMiddleware";
import { myVacationRules, validate } from "../middleware/validation";

const router = express.Router();

// Autoservicio: solo exige una sesión válida. El servicio deriva el empleado de
// users.employeeId, así que nunca se acepta un id de empleado desde el cliente.
router.get("/overview", authenticateToken, meController.getMyOverview);
router.post(
  "/vacations",
  authenticateToken,
  myVacationRules,
  validate,
  meController.createMyVacation,
);

export default router;
