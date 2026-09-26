import express from "express";
import * as roleController from "../controllers/roleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  roleRules,
  roleUpdateRules,
  roleNameParam,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, roleController.getRoles);
router.get("/:id", authenticateToken, idParam, validate, roleController.getRoleById);
router.get("/name/:name", authenticateToken, roleNameParam, validate, roleController.getRoleByName);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_ROLE),
  roleRules,
  validate,
  roleController.createRole,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_ROLE),
  roleUpdateRules,
  validate,
  roleController.updateRole,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_ROLE),
  idParam,
  validate,
  roleController.deleteRole,
);

export default router;
