import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Notification, NotificationFilters } from "../models/Notification";
import { notificationEvents } from "../services/notificationService";
import {
  fetchNotificationsFromApi,
  createNotificationInApi,
  markAsReadInApi,
  markAllAsReadInApi,
  deleteNotificationInApi,
  deleteAllNotificationsInApi,
  generatePaymentRemindersInApi,
} from "../services/notificationService";
import { useAuthContext } from "./AuthContext";
import {
  getNotificationSettings,
  notificationSourceToSettingKey,
} from "../constants/notificationSettings.constants";

interface NotificationContextType {
  notifications: Notification[];
  allNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  filters: NotificationFilters;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  deleteAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  updateFilters: (newFilters: Partial<NotificationFilters>) => void;
  clearFilters: () => void;
  getNotificationsByCategory: (category: Notification["category"]) => Notification[];
  getHighPriorityNotifications: () => Notification[];
  cleanOldNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Whether a notification type is enabled for this user (defaults to enabled).
  const isNotificationEnabled = useCallback(
    (source?: string) => {
      if (!currentUser) return true;
      const settings = getNotificationSettings(currentUser.settings);
      const key = notificationSourceToSettingKey(source);
      if (!key) return true;
      return settings[key];
    },
    [currentUser],
  );

  // Keep the latest notification settings in a ref so the load effect below
  // only re-runs when the logged-in user id changes. Without this, every
  // settings update (e.g. toggling a notification switch) replaces the
  // currentUser object, which re-created isNotificationEnabled and triggered
  // a full notifications refetch on each toggle.
  const notificationSettingsRef = useRef<Record<string, boolean>>({});
  notificationSettingsRef.current = currentUser
    ? getNotificationSettings(currentUser.settings)
    : {};

  // Re-filter in-memory notifications when notification settings change
  // (e.g. the user disables a notification type in Settings). This is purely
  // local — no API refetch — so toggling a switch stays instant.
  const appliedSettingsRef = useRef<string | null>(null);
  useEffect(() => {
    const settingsKey = JSON.stringify(notificationSettingsRef.current);
    if (settingsKey === appliedSettingsRef.current) return;
    appliedSettingsRef.current = settingsKey;
    const settings = notificationSettingsRef.current;
    setNotifications((prev) =>
      prev.filter((n) => {
        const key = notificationSourceToSettingKey(n.source);
        if (!key) return true;
        return settings[key] ?? true;
      }),
    );
  }, [currentUser?.settings]);

  // Sync notifications from the database whenever the logged-in user changes.
  // Also generates payment reminders (15th / last day of month) on open.
  useEffect(() => {
    if (!currentUser?.id) {
      setNotifications([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const load = async () => {
      try {
        // Idempotent: creates today's payment reminder if today is the 15th
        // or the last day of the month, otherwise does nothing.
        await generatePaymentRemindersInApi();
        const data = await fetchNotificationsFromApi();
        if (!cancelled) {
          const settings = notificationSettingsRef.current;
          setNotifications(
            data.filter((n) => {
              const key = notificationSourceToSettingKey(n.source);
              if (!key) return true;
              return settings[key] ?? true;
            }),
          );
        }
      } catch (error) {
        // Keep previous notifications on failure (offline / API down)
        // eslint-disable-next-line no-console
        console.error("[NotificationContext] Error loading notifications:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  // Get unread count
  const unreadCount = useMemo(() => {
    const count = notifications.filter(n => !n.read).length;
    return count;
  }, [notifications]);

  // Get filtered notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filters.read !== undefined && notification.read !== filters.read) {
      return false;
    }
    if (filters.type && notification.type !== filters.type) {
      return false;
    }
    if (filters.category && notification.category !== filters.category) {
      return false;
    }
    if (filters.priority && notification.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  // Mark notification as read (optimistic update + API sync)
  const markAsRead = useCallback(
    (notificationId: string) => {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      );
      markAsReadInApi(notificationId).catch(() => {
        // Silent: server will reconcile on next load
      });
    },
    [],
  );

  // Mark all as read (optimistic update + API sync)
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    markAllAsReadInApi().catch(() => {
      // Silent
    });
  }, []);

  // Delete notification (optimistic update + API sync)
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    deleteNotificationInApi(notificationId).catch(() => {
      // Silent
    });
  }, []);

  // Delete all notifications (optimistic update + API sync)
  const deleteAllNotifications = useCallback(() => {
    setNotifications([]);
    deleteAllNotificationsInApi().catch(() => {
      // Silent
    });
  }, []);

  // Add new notification (optimistic local + persist to DB, then reconcile the id)
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      // Skip if this notification type is disabled in the user's settings
      if (!isNotificationEnabled(notification.source)) {
        return;
      }
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newNotification: Notification = {
        ...notification,
        id: tempId,
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);

      if (currentUser?.id) {
        createNotificationInApi(notification)
          .then(created => {
            // Swap the optimistic temp id for the server-assigned id
            setNotifications(prev =>
              prev.map(n => (n.id === tempId ? { ...created } : n)),
            );
          })
          .catch(() => {
            // Silent: kept locally in memory with temp id
          });
      }
    },
    [currentUser?.id, isNotificationEnabled],
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get notifications by category
  const getNotificationsByCategory = useCallback(
    (category: Notification["category"]) => {
      return notifications.filter(n => n.category === category);
    },
    [notifications],
  );

  // Get high priority notifications
  const getHighPriorityNotifications = useCallback(() => {
    return notifications.filter(n => n.priority === "high" && !n.read);
  }, [notifications]);

  // Clean old notifications (older than 30 days) locally
  const cleanOldNotifications = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setNotifications(prev => prev.filter(notification => notification.timestamp > thirtyDaysAgo));
  }, []);

  // Subscribe to notification events (helpers like createEmployeeNotification)
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(newNotification => {
      addNotification(newNotification);
    });

    return unsubscribe;
  }, [addNotification]);

  const value = {
    notifications: filteredNotifications,
    allNotifications: notifications,
    unreadCount,
    isLoading,
    filters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    addNotification,
    updateFilters,
    clearFilters,
    getNotificationsByCategory,
    getHighPriorityNotifications,
    cleanOldNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};

export const useNotificationMenu = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotificationMenu must be used within a NotificationProvider");
  }
  return context;
};
