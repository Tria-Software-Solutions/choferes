import express from "express";
import * as licenseController from "../controllers/employeeLicenseController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  licenseRules,
  licenseUpdateRules,
  licenseQueryRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, licenseQueryRules, validate, licenseController.getLicenses);
router.get("/:id", authenticateToken, idParam, validate, licenseController.getLicenseById);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.CREATE_LICENSE),
  licenseRules,
  validate,
  licenseController.createLicense,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_LICENSE),
  idParam,
  licenseUpdateRules,
  validate,
  licenseController.updateLicense,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.DELETE_LICENSE),
  idParam,
  validate,
  licenseController.deleteLicense,
);

export default router;
