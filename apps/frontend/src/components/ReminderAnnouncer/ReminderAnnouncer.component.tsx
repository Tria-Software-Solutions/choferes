import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TASK_REMINDER_EVENT } from "../../context/NotificationContext";
import { useAppNotifications } from "../Snackbar/Snackbar.component";
import type { Notification as AppNotification } from "../../models/Notification";

// Announces task reminders as they arrive: an in-app toast always, plus a
// desktop notification when the tab is in the background and the user
// granted permission (clicking it focuses the app and opens the task).
const ReminderAnnouncer: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useAppNotifications();

  useEffect(() => {
    const onReminder = (event: Event) => {
      const reminder = (event as CustomEvent<AppNotification>).detail;
      showNotification(`${reminder.title}. ${reminder.message}`, { severity: "info", duration: 8000 });

      const canNotify =
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.visibilityState !== "visible";
      if (!canNotify) return;
      try {
        const desktop = new Notification(reminder.title, {
          body: reminder.message,
          tag: reminder.source,
          icon: "/favicon.ico",
        });
        desktop.onclick = () => {
          window.focus();
          if (reminder.actionUrl) navigate(reminder.actionUrl);
          desktop.close();
        };
      } catch {
        // Some browsers (iOS) only allow notifications from a service worker.
      }
    };
    window.addEventListener(TASK_REMINDER_EVENT, onReminder);
    return () => window.removeEventListener(TASK_REMINDER_EVENT, onReminder);
  }, [navigate, showNotification]);

  return null;
};

export default ReminderAnnouncer;
