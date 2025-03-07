import express from "express";
import * as monthlySummaryController from "../controllers/monthlySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  monthlySummaryController.getMonthlySummaries
);
router.get(
  "/:id",
  authenticateToken,
  monthlySummaryController.getMonthlySummaryById
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
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  monthlySummaryController.deleteMonthlySummary
);

export default router;
