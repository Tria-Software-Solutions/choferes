// Controller for handling HTTP requests related to notifications
import { Request, Response } from "express";
import * as notificationService from "../services/notificationService";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

const getUserId = (req: Request): number | undefined => (req as AuthenticatedRequest).user?.id;

// Get all notifications for the authenticated user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const notifications = await notificationService.getNotificationsByUser(userId);
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching notifications", error });
  }
};

// Create a new notification for the authenticated user
export const createNotification = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const notification = await notificationService.createNotification(userId, req.body);
    return res.status(201).json(notification);
  } catch (error) {
    return res.status(500).json({ message: "Error creating notification", error });
  }
};

// Mark a single notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = parseInt(req.params.id, 10);
    const updated = await notificationService.markAsRead(userId, id);
    if (updated) {
      return res.status(200).json(updated);
    }
    return res.status(404).json({ message: "Notification not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating notification", error });
  }
};

// Mark all notifications as read for the authenticated user
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await notificationService.markAllAsRead(userId);
    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating notifications", error });
  }
};

// Delete a single notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = parseInt(req.params.id, 10);
    const deleted = await notificationService.deleteNotification(userId, id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Notification not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting notification", error });
  }
};

// Delete all notifications for the authenticated user
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await notificationService.deleteAllNotifications(userId);
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ message: "Error deleting all notifications", error });
  }
};

// Generate payment reminders for the 15th / last day of the month (idempotent)
// Accepts an optional "today" (YYYY-MM-DD) from the client for timezone accuracy.
export const generatePaymentReminders = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const today =
      typeof req.body?.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.body.today)
        ? req.body.today
        : undefined;
    const created = await notificationService.generatePaymentReminders(userId, today);
    return res.status(200).json({ created, count: created.length });
  } catch (error) {
    return res.status(500).json({ message: "Error generating payment reminders", error });
  }
};
