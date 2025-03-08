import express from "express";
import * as employeeController from "../controllers/employeeController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, employeeController.getEmployees);
router.get("/:id", authenticateToken, employeeController.getEmployeeById);
router.post(
  "/",
  authenticateToken,
  employeeController.createEmployee
);
router.put(
  "/:id",
  authenticateToken,
  employeeController.updateEmployee
);
router.delete(
  "/:id",
  authenticateToken,
  employeeController.deleteEmployee
);

export default router;
