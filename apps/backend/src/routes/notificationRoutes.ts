import express from "express";
import * as notificationController from "../controllers/notificationController";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  idParam,
  notificationRules,
  paymentReminderRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

router.get("/", authenticateToken, notificationController.getNotifications);
router.post(
  "/generate-payment-reminders",
  authenticateToken,
  paymentReminderRules,
  validate,
  notificationController.generatePaymentReminders,
);
router.post(
  "/",
  authenticateToken,
  notificationRules,
  validate,
  notificationController.createNotification,
);
router.patch("/:id/read", authenticateToken, idParam, validate, notificationController.markAsRead);
router.patch("/read-all", authenticateToken, notificationController.markAllAsRead);
router.delete(
  "/:id",
  authenticateToken,
  idParam,
  validate,
  notificationController.deleteNotification,
);
router.delete("/", authenticateToken, notificationController.deleteAllNotifications);

export default router;
