import express from "express";
import * as scheduleController from "../controllers/scheduleController";
import { authenticateToken } from "../middleware/authMiddleware";
import { authorizeRole } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/", authenticateToken, scheduleController.getSchedules);
router.get("/:id", authenticateToken, scheduleController.getScheduleById);
router.post(
  "/",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  scheduleController.createSchedule
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  scheduleController.updateSchedule
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Super Administrador, Administrador"]),
  scheduleController.deleteSchedule
);

export default router;
