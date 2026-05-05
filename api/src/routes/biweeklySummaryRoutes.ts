import express from "express";
import * as biweeklySummaryController from "../controllers/biweeklySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, biweeklySummaryController.getBiweeklySummaries);
router.get("/employee/:id", authenticateToken, biweeklySummaryController.getCurrentBiweeklySummary);
router.post("/", authenticateToken, biweeklySummaryController.createBiweeklySummary);
router.put("/:id", authenticateToken, biweeklySummaryController.updateBiweeklySummary);
router.delete("/:id", authenticateToken, biweeklySummaryController.deleteBiweeklySummary);
router.delete("/bulk", authenticateToken, biweeklySummaryController.deleteAllBiweeklySummaries);

export default router;
