import api from "./api";
import { Notification } from "../models/Notification";

// ------------------------------------------------------------------
// API calls (notifications are persisted per-user in the database)
// ------------------------------------------------------------------

// Map a backend notification row to the frontend Notification model
const mapApiNotification = (row: {
  id: number | string;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  read: boolean;
  actionUrl?: string | null;
  actionText?: string | null;
  source?: string | null;
  createdAt: string;
}): Notification => ({
  id: String(row.id),
  title: row.title,
  message: row.message,
  type: (row.type as Notification["type"]) || "info",
  category: (row.category as Notification["category"]) || "system",
  priority: (row.priority as Notification["priority"]) || "low",
  read: Boolean(row.read),
  actionUrl: row.actionUrl || undefined,
  actionText: row.actionText || undefined,
  source: row.source || undefined,
  timestamp: new Date(row.createdAt),
});

// Fetch all notifications for the current user
export const fetchNotificationsFromApi = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications", { headers: { "x-no-cache": "true" } });
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map(mapApiNotification);
};

// Create a notification in the database
export const createNotificationInApi = async (
  notification: Omit<Notification, "id" | "timestamp" | "read">,
): Promise<Notification> => {
  const response = await api.post("/notifications", notification);
  return mapApiNotification(response.data);
};

// Generate payment reminders for the 15th / last day of the month (idempotent).
// Sends the user's local date so the backend computes the reminder in the
// user's timezone instead of the server's.
export const generatePaymentRemindersInApi = async () => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const response = await api.post("/notifications/generate-payment-reminders", { today });
  return response.data as { created: number; count: number };
};

// Mark a single notification as read
export const markAsReadInApi = async (notificationId: string) => {
  await api.patch(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsReadInApi = async () => {
  await api.patch("/notifications/read-all");
};

// Delete a single notification
export const deleteNotificationInApi = async (notificationId: string) => {
  await api.delete(`/notifications/${notificationId}`);
};

// Delete all notifications
export const deleteAllNotificationsInApi = async () => {
  await api.delete("/notifications");
};
