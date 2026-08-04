import express from "express";
import * as employeeController from "../controllers/employeeController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  idParam,
  employeeRules,
  employeeUpdateRules,
  paginationRules,
  validate,
} from "../middleware/validation";
import {
  upload as multerUpload,
  uploadEmployeeAvatar,
  deleteEmployeeAvatar,
} from "../controllers/avatarController";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, employeeController.getEmployees);
router.get("/:id", authenticateToken, idParam, validate, employeeController.getEmployeeById);
router.post("/", authenticateToken, employeeRules, validate, employeeController.createEmployee);
router.put(
  "/:id",
  authenticateToken,
  employeeUpdateRules,
  validate,
  employeeController.updateEmployee,
);
router.delete("/:id", authenticateToken, idParam, validate, employeeController.deleteEmployee);

// Employee avatar routes (base64 stored in DB, mirrors user avatar approach)
router.post("/:id/avatar", authenticateToken, multerUpload.single("avatar"), uploadEmployeeAvatar);
router.delete("/:id/avatar", authenticateToken, deleteEmployeeAvatar);

export default router;
