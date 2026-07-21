import express from "express";
import * as biweeklySummaryController from "../controllers/biweeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
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
router.post("/", authenticateToken, biweeklySummaryController.createBiweeklySummary);
router.put("/:id", authenticateToken, biweeklySummaryController.updateBiweeklySummary);
router.delete("/bulk", authenticateToken, biweeklySummaryController.deleteAllBiweeklySummaries);
router.delete("/:id", authenticateToken, biweeklySummaryController.deleteBiweeklySummary);

export default router;
