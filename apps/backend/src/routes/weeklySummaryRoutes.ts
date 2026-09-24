import express from "express";
import * as weeklySummaryController from "../controllers/weeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSIONS } from "../constants/permissions";
import { paginationRules, validate } from "../middleware/validation";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  paginationRules,
  validate,
  weeklySummaryController.getWeeklySummaries,
);
router.get("/employee/:id", authenticateToken, weeklySummaryController.getCurrentWeeklySummary);
router.get(
  "/employee/:id/has-worked",
  authenticateToken,
  weeklySummaryController.hasWorkedCurrenWeeklySummary,
);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_WEEKLY_SUMMARY),
  weeklySummaryController.createWeeklySummary,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_WEEKLY_SUMMARY),
  weeklySummaryController.updateWeeklySummary,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_WEEKLY_SUMMARY),
  weeklySummaryController.deleteWeeklySummary,
);

export default router;
