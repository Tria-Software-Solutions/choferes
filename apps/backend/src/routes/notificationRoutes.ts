import express from "express";
import * as notificationController from "../controllers/notificationController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  idParam,
  notificationRules,
  paymentReminderRules,
  validate,
} from "../middleware/validation";

const router = express.Router();

// Notificaciones propias: cada endpoint exige su permiso de autoservicio (se
// concede a todos los roles base) y el servicio acota cada consulta al usuario.
const canView = requirePermission(PERMISSION_CODES.VIEW_NOTIFICATIONS);
const canEdit = requirePermission(PERMISSION_CODES.EDIT_NOTIFICATIONS);
const canDelete = requirePermission(PERMISSION_CODES.DELETE_NOTIFICATIONS);

router.get("/", authenticateToken, canView, notificationController.getNotifications);
router.post(
  "/generate-payment-reminders",
  authenticateToken,
  canView,
  paymentReminderRules,
  validate,
  notificationController.generatePaymentReminders,
);
router.post(
  "/",
  authenticateToken,
  canEdit,
  notificationRules,
  validate,
  notificationController.createNotification,
);
router.patch(
  "/:id/read",
  authenticateToken,
  canEdit,
  idParam,
  validate,
  notificationController.markAsRead,
);
router.patch("/read-all", authenticateToken, canEdit, notificationController.markAllAsRead);
router.delete(
  "/:id",
  authenticateToken,
  canDelete,
  idParam,
  validate,
  notificationController.deleteNotification,
);
router.delete("/", authenticateToken, canDelete, notificationController.deleteAllNotifications);

export default router;
