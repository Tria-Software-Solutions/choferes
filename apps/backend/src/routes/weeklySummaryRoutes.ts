import express from "express";
import * as weeklySummaryController from "../controllers/weeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
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
router.get("/employee/:id/has-worked", weeklySummaryController.hasWorkedCurrenWeeklySummary);
router.post("/", authenticateToken, weeklySummaryController.createWeeklySummary);
router.put("/:id", authenticateToken, weeklySummaryController.updateWeeklySummary);
router.delete("/bulk", authenticateToken, weeklySummaryController.deleteAllWeeklySummaries);
router.delete("/:id", authenticateToken, weeklySummaryController.deleteWeeklySummary);

export default router;
