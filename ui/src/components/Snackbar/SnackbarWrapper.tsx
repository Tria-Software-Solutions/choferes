import React, { createContext, useContext } from "react";
import {
  useNotifications,
  NotificationsProvider,
} from "@toolpad/core/useNotifications";

interface NotificationContextType {
  showNotification: (
    message: string,
    severity?: "success" | "error" | "warning" | "info"
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useAppNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useAppNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const AppNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const notifications = useNotifications();

  const showNotification = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    notifications.show(message, {
      severity,
      autoHideDuration: 3000,
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default function SnackbarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationsProvider>
      <AppNotificationProvider>{children}</AppNotificationProvider>
    </NotificationsProvider>
  );
}
