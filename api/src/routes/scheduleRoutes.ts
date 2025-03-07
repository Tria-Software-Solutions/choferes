import express from "express";
import * as scheduleController from "../controllers/scheduleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";
import { Roles } from "../enums/roles";

const router = express.Router();

router.get("/", authenticateToken, scheduleController.getSchedules);
router.get("/:id", authenticateToken, scheduleController.getScheduleById);
router.post(
  "/",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  scheduleController.createSchedule
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  scheduleController.updateSchedule
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([Roles.MANAGER, Roles.ADMINISTRATIVE]),
  scheduleController.deleteSchedule
);

export default router;
