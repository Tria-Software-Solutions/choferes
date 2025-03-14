import express from "express";
import * as monthlySummaryController from "../controllers/monthlySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  monthlySummaryController.getMonthlySummaries
);
router.get(
  "/employee/:id",
  authenticateToken,
  monthlySummaryController.getCurrentMonthlySummary
);
router.post(
  "/",
  authenticateToken,
  monthlySummaryController.createMonthlySummary
);
router.put(
  "/:id",
  authenticateToken,
  monthlySummaryController.updateMonthlySummary
);
router.delete(
  "/:id",
  authenticateToken,
  monthlySummaryController.deleteMonthlySummary
);

export default router;
