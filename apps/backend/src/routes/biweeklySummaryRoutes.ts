import express from "express";
import * as biweeklySummaryController from "../controllers/biweeklySummaryController";
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
  biweeklySummaryController.getBiweeklySummaries,
);
router.get("/employee/:id", authenticateToken, biweeklySummaryController.getCurrentBiweeklySummary);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_BIWEEKLY_SUMMARY),
  biweeklySummaryController.createBiweeklySummary,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_BIWEEKLY_SUMMARY),
  biweeklySummaryController.updateBiweeklySummary,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_BIWEEKLY_SUMMARY),
  biweeklySummaryController.deleteBiweeklySummary,
);

export default router;
