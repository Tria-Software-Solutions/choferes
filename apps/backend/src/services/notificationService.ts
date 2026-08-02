// Service for business logic and database operations related to notifications
import { Notification } from "../models/Notification";
import { User } from "../models/User";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationCategory = "employee" | "schedule" | "vehicle" | "system" | "report";
export type NotificationPriority = "low" | "medium" | "high";

interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  source?: string;
}

const ATTRIBUTES = [
  "id",
  "userId",
  "title",
  "message",
  "type",
  "category",
  "priority",
  "read",
  "actionUrl",
  "actionText",
  "source",
  "createdAt",
  "updatedAt",
];

// Get all notifications for a user (newest first), removing any older than 30 days
export const getNotificationsByUser = async (userId: number) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await Notification.destroy({
    where: {
      userId,
      createdAt: { $lt: thirtyDaysAgo },
    },
  });

  return Notification.findAll({
    where: { userId },
    attributes: ATTRIBUTES,
    order: [["createdAt", "DESC"]],
  });
};

// Create a new notification for a user
export const createNotification = async (userId: number, data: CreateNotificationData) => {
  const notification = await Notification.create({ ...data, userId });
  await notification.reload();
  return notification;
};

// Mark a single notification as read
export const markAsRead = async (userId: number, id: number) => {
  await Notification.update({ read: true }, { where: { id, userId } });
  return Notification.findByPk(id, { attributes: ATTRIBUTES });
};

// Mark all notifications as read for a user
export const markAllAsRead = async (userId: number) => {
  await Notification.update({ read: true }, { where: { userId } });
};

// Delete a single notification
export const deleteNotification = async (userId: number, id: number) =>
  Notification.destroy({ where: { id, userId } });

// Delete all notifications for a user
export const deleteAllNotifications = async (userId: number) =>
  Notification.destroy({ where: { userId } });

// Generate payment reminders for the 15th and last day of each month (idempotent by source)
// Accepts an optional "today" date (YYYY-MM-DD) from the client so the reminder is
// computed in the user's local timezone instead of the server's.
export const generatePaymentReminders = async (userId: number, today?: string) => {
  const now = today ? new Date(`${today}T12:00:00`) : new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const monthName = MONTH_NAMES[month];

  // Respect the user's notification settings (default: enabled)
  const user = await User.findByPk(userId);
  const notifSettings =
    ((user?.settings as Record<string, unknown> | undefined)?.notifications as
      Record<string, unknown> | undefined) ?? {};
  const paymentsEnabled = notifSettings.payments !== false;

  // Last day of the current month (28/29/30/31 depending on month and leap year)
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  const reminders: CreateNotificationData[] = [];

  if (paymentsEnabled && day === 15) {
    reminders.push({
      source: `payment-1:${year}-${month + 1}`,
      title: "Pago de Quincena 1",
      message: `Hoy es 15 de ${monthName}. Revisa las horas de la primera quincena y realiza los pagos a los choferes.`,
      type: "warning",
      category: "report",
      priority: "high",
      actionUrl: "/dashboard",
      actionText: "Ver resumen quincenal",
    });
  }

  if (paymentsEnabled && day === lastDayOfMonth) {
    reminders.push({
      source: `payment-2:${year}-${month + 1}`,
      title: "Pago de Quincena 2",
      message: `Hoy cierra el mes. Revisa las horas de la segunda quincena y realiza los pagos antes de terminar el día.`,
      type: "warning",
      category: "report",
      priority: "high",
      actionUrl: "/dashboard",
      actionText: "Ver resumen quincenal",
    });
  }

  const results = await Promise.all(
    reminders.map(async (reminder) => {
      const existing = await Notification.findOne({
        where: { userId, source: reminder.source },
      });
      if (existing) {
        return null;
      }
      try {
        // Unique (userId, source) index prevents duplicates even on races
        return await Notification.create({ ...reminder, userId });
      } catch (error) {
        // Only treat unique-constraint races as benign; rethrow real errors
        if ((error as { name?: string }).name !== "SequelizeUniqueConstraintError") {
          throw error;
        }
        // Another concurrent request already created this reminder
        return Notification.findOne({
          where: { userId, source: reminder.source },
        });
      }
    }),
  );
  const created: Notification[] = results.filter((n): n is Notification => n !== null);
  return created;
};

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
