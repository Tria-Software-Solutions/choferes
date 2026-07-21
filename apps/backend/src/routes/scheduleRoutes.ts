import express from "express";
import * as scheduleController from "../controllers/scheduleController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  idParam,
  scheduleRules,
  scheduleUpdateRules,
  paginationRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, paginationRules, validate, scheduleController.getSchedules);
router.get("/:id", authenticateToken, idParam, validate, scheduleController.getScheduleById);
router.post("/", authenticateToken, scheduleRules, validate, scheduleController.createSchedule);
router.put(
  "/:id",
  authenticateToken,
  scheduleUpdateRules,
  validate,
  scheduleController.updateSchedule,
);
router.delete("/:id", authenticateToken, idParam, validate, scheduleController.deleteSchedule);

export default router;
