import { useState, useCallback, useEffect, useMemo } from 'react';
import { Notification, NotificationFilters } from '../models/Notification';
import { notificationEvents } from '../services/notificationService';

// LocalStorage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';

// Helper functions for localStorage
const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((notification: { timestamp: string; [key: string]: unknown }) => ({
        ...notification,
        timestamp: new Date(notification.timestamp)
      }));
    }
  } catch (error) {
    // Silently handle localStorage errors
  }
  return [];
};

const saveNotificationsToStorage = (notifications: Notification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    // Silently handle localStorage errors
  }
};

export const useNotificationMenu = () => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    return loadNotificationsFromStorage();
  });
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [isLoading] = useState(false);

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

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== notificationId);
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  // Delete all notifications
  const deleteAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotificationsToStorage([]);
  }, []);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get notifications by category
  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  // Get high priority notifications
  const getHighPriorityNotifications = useCallback(() => {
    return notifications.filter(n => n.priority === 'high' && !n.read);
  }, [notifications]);

  // Clean old notifications (older than 30 days)
  const cleanOldNotifications = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setNotifications(prev => {
      const updated = prev.filter(notification => 
        notification.timestamp > thirtyDaysAgo
      );
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  // Subscribe to notification events
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe((newNotification) => {
      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        saveNotificationsToStorage(updated);
        return updated;
      });
    });

    return unsubscribe;
  }, []);

  // Clean old notifications on mount
  useEffect(() => {
    cleanOldNotifications();
  }, [cleanOldNotifications]);

  return {
    notifications: filteredNotifications,
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
    cleanOldNotifications
  };
}; 