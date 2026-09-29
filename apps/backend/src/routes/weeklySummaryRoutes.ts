import express from "express";
import * as weeklySummaryController from "../controllers/weeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import { paginationRules, validate } from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_WEEKLY_SUMMARY),
  paginationRules,
  validate,
  weeklySummaryController.getWeeklySummaries,
);
router.get(
  "/employee/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_WEEKLY_SUMMARY),
  weeklySummaryController.getCurrentWeeklySummary,
);
router.get(
  "/employee/:id/has-worked",
  authenticateToken,
  requirePermission(PERMISSION_CODES.VIEW_WEEKLY_SUMMARY),
  weeklySummaryController.hasWorkedCurrenWeeklySummary,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_WEEKLY_SUMMARY),
  weeklySummaryController.createWeeklySummary,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_WEEKLY_SUMMARY),
  weeklySummaryController.updateWeeklySummary,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSION_CODES.EDIT_WEEKLY_SUMMARY),
  weeklySummaryController.deleteWeeklySummary,
);

export default router;
