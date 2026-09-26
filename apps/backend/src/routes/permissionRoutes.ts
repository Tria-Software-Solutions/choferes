import express from "express";
import * as permissionController from "../controllers/permissionController";
import { authenticateToken } from "../middleware/authMiddleware";
import { idParam, permissionNamesParam, paginationRules, validate } from "../middleware/validation";

const router = express.Router();

// The permission catalog is code-owned (see @choferes/shared PERMISSION_CATALOG),
// so there is intentionally no create/update/delete endpoint here — permissions
// are provisioned through migrations/seeders instead of at runtime.
router.get("/", authenticateToken, paginationRules, validate, permissionController.getPermissions);
router.get("/:id", authenticateToken, idParam, validate, permissionController.getPermissionById);
router.get(
  "/names/:names",
  authenticateToken,
  permissionNamesParam,
  validate,
  permissionController.getPermissionsByNames,
);

export default router;
