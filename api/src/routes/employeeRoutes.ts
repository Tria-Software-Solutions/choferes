import express from "express";
import * as employeeController from "../controllers/employeeController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, employeeController.getEmployees);
router.get("/:id", authenticateToken, employeeController.getEmployeeById);
router.post(
  "/",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  employeeController.createEmployee
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  employeeController.deleteEmployee
);

export default router;
