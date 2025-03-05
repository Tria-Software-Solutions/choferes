import express from "express";
import * as employeeController from "../controllers/employeeController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, employeeController.getEmployees);
router.get("/:id", authenticateToken, employeeController.getEmployeeById);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  employeeController.createEmployee
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  employeeController.deleteEmployee
);

export default router;
