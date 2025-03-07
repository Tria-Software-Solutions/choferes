import express from "express";
import * as biweeklySummaryController from "../controllers/biweeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  biweeklySummaryController.getBiweeklySummaries
);
router.get(
  "/:id",
  authenticateToken,
  biweeklySummaryController.getBiweeklySummaryById
);
router.post(
  "/",
  authenticateToken,
  biweeklySummaryController.createBiweeklySummary
);
router.put(
  "/:id",
  authenticateToken,
  biweeklySummaryController.updateBiweeklySummary
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  biweeklySummaryController.deleteBiweeklySummary
);

export default router;
