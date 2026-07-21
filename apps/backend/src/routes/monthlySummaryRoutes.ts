import express from "express";
import * as monthlySummaryController from "../controllers/monthlySummaryController";
import { authenticateToken } from "../middleware/authMiddleware";
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
router.post("/", authenticateToken, monthlySummaryController.createMonthlySummary);
router.put("/:id", authenticateToken, monthlySummaryController.updateMonthlySummary);
router.delete("/bulk", authenticateToken, monthlySummaryController.deleteAllMonthlySummaries);
router.delete("/:id", authenticateToken, monthlySummaryController.deleteMonthlySummary);

export default router;
