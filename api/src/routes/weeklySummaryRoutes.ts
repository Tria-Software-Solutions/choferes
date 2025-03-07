import express from "express";
import * as weeklySummaryController from "../controllers/weeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, weeklySummaryController.getWeeklySummaries);
router.get(
  "/:id",
  authenticateToken,
  weeklySummaryController.getWeeklySummaryById
);
router.post(
  "/",
  authenticateToken,
  weeklySummaryController.createWeeklySummary
);
router.put(
  "/:id",
  authenticateToken,
  weeklySummaryController.updateWeeklySummary
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  weeklySummaryController.deleteWeeklySummary
);

export default router;
