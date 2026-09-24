import express from "express";
import * as monthlySummaryController from "../controllers/monthlySummaryController";
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
  monthlySummaryController.getMonthlySummaries,
);
router.get("/employee/:id", authenticateToken, monthlySummaryController.getCurrentMonthlySummary);
router.post(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_MONTHLY_SUMMARY),
  monthlySummaryController.createMonthlySummary,
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_MONTHLY_SUMMARY),
  monthlySummaryController.updateMonthlySummary,
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(PERMISSIONS.EDIT_MONTHLY_SUMMARY),
  monthlySummaryController.deleteMonthlySummary,
);

export default router;
