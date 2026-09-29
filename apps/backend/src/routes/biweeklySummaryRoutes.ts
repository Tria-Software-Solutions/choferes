import express from "express";
import * as biweeklySummaryController from "../controllers/biweeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import { biweeklySummaryQueryRules, validate } from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_BIWEEKLY_SUMMARY),
  biweeklySummaryQueryRules,
  validate,
  biweeklySummaryController.getBiweeklySummaries,
);
router.get(
  "/employee/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_BIWEEKLY_SUMMARY),
  biweeklySummaryController.getCurrentBiweeklySummary,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_BIWEEKLY_SUMMARY),
  biweeklySummaryController.createBiweeklySummary,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_BIWEEKLY_SUMMARY),
  biweeklySummaryController.updateBiweeklySummary,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_BIWEEKLY_SUMMARY),
  biweeklySummaryController.deleteBiweeklySummary,
);

export default router;
