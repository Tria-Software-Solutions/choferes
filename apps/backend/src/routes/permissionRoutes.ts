import express from "express";
import * as permissionController from "../controllers/permissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSIONS } from "../constants/permissions";
import {
  idParam,
  permissionRules,
  permissionNamesParam,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, permissionController.getPermissions);
router.get("/:id", authenticateToken, idParam, validate, permissionController.getPermissionById);
router.get(
  "/names/:names",
  authenticateToken,
  permissionNamesParam,
  validate,
  permissionController.getPermissionsByNames,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_ROLE),
  permissionRules,
  validate,
  permissionController.createPermission,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_ROLE),
  idParam,
  validate,
  permissionController.deletePermission,
);

export default router;
