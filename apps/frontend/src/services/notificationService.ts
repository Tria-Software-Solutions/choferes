import api from "./api";
import { Notification } from "../models/Notification";

// Event emitter for notifications
class NotificationEventEmitter {
  private listeners: ((notification: Notification) => void)[] = [];

  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  emit(notification: Notification) {
    this.listeners.forEach(listener => listener(notification));
  }
}

export const notificationEvents = new NotificationEventEmitter();

// Service to add notifications to the menu
export const addNotificationToMenu = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date(),
    read: false
  };

  // Emit the notification to all subscribers
  notificationEvents.emit(newNotification);
};

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

// Helper functions to create common notifications
export const createEmployeeNotification = (action: 'created' | 'updated' | 'deleted', employeeName: string) => {
  const actions = {
    created: { title: 'Nuevo empleado registrado', message: `${employeeName} ha sido registrado en el sistema` },
    updated: { title: 'Empleado actualizado', message: `${employeeName} ha sido actualizado` },
    deleted: { title: 'Empleado eliminado', message: `${employeeName} ha sido eliminado del sistema` }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'deleted' ? 'warning' : 'success',
    category: 'employee',
    priority: 'medium',
    actionUrl: '/employees',
    actionText: 'Ver empleados',
    source: 'employee'
  });
};

export const createScheduleNotification = (action: 'created' | 'updated' | 'deleted', scheduleName: string) => {
  const actions = {
    created: { title: 'Nuevo horario creado', message: `El horario "${scheduleName}" ha sido creado` },
    updated: { title: 'Horario actualizado', message: `El horario "${scheduleName}" ha sido modificado` },
    deleted: { title: 'Horario eliminado', message: `El horario "${scheduleName}" ha sido eliminado` }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'deleted' ? 'warning' : 'success',
    category: 'schedule',
    priority: 'low',
    actionUrl: '/schedules',
    actionText: 'Ver horarios',
    source: 'schedule'
  });
};

export const createVehicleNotification = (action: 'created' | 'updated' | 'deleted', vehicleInfo: string) => {
  const actions = {
    created: { title: 'Nuevo vehículo registrado', message: vehicleInfo },
    updated: { title: 'Vehículo actualizado', message: vehicleInfo },
    deleted: { title: 'Vehículo eliminado', message: vehicleInfo }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'deleted' ? 'warning' : 'success',
    category: 'vehicle',
    priority: 'medium',
    actionUrl: '/vehicles',
    actionText: 'Ver vehículos',
    source: 'vehicle'
  });
};

export const createCourierNotification = (action: 'created' | 'updated' | 'deleted', courierInfo: string) => {
  const actions = {
    created: { title: 'Nuevo servicio de courier registrado', message: courierInfo },
    updated: { title: 'Servicio de courier actualizado', message: courierInfo },
    deleted: { title: 'Servicio de courier eliminado', message: courierInfo }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'deleted' ? 'warning' : 'success',
    category: 'system',
    priority: 'medium',
    actionUrl: '/courier-services',
    actionText: 'Ver servicios',
    source: 'courier'
  });
};

export const createUserNotification = (action: 'created' | 'updated' | 'deleted', userName: string) => {
  const actions = {
    created: { title: 'Nuevo usuario registrado', message: `${userName} ha sido registrado en el sistema` },
    updated: { title: 'Usuario actualizado', message: `${userName} ha sido actualizado` },
    deleted: { title: 'Usuario eliminado', message: `${userName} ha sido eliminado del sistema` }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'deleted' ? 'warning' : 'success',
    category: 'system',
    priority: 'high',
    actionUrl: '/dashboard',
    actionText: 'Ver usuarios',
    source: 'user'
  });
};

export const createRoleNotification = (action: 'created' | 'updated' | 'deleted', roleName: string) => {
  const actions = {
    created: { title: 'Nuevo rol creado', message: `El rol "${roleName}" ha sido creado` },
    updated: { title: 'Rol actualizado', message: `El rol "${roleName}" ha sido modificado` },
    deleted: { title: 'Rol eliminado', message: `El rol "${roleName}" ha sido eliminado` }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'deleted' ? 'warning' : 'success',
    category: 'system',
    priority: 'high',
    actionUrl: '/dashboard',
    actionText: 'Ver roles',
    source: 'role'
  });
};

export const createHoursGenerationNotification = (success: boolean, employeeCount?: number) => {
  if (success) {
    return addNotificationToMenu({
      title: 'Horas generadas exitosamente',
      message: employeeCount ? `Se generaron horas para ${employeeCount} empleados` : 'Se generaron las horas automáticamente',
      type: 'success',
      category: 'report',
      priority: 'high',
      actionUrl: '/roles',
      actionText: 'Ver resultados',
      source: 'hours'
    });
  } else {
    return addNotificationToMenu({
      title: 'Error al generar horas',
      message: 'Hubo un problema al generar las horas automáticamente',
      type: 'error',
      category: 'report',
      priority: 'high',
      actionUrl: '/roles',
      actionText: 'Reintentar',
      source: 'hours'
    });
  }
};

export const createSystemNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
  return addNotificationToMenu({
    title,
    message,
    type,
    category: 'system',
    priority: 'low',
    source: 'system'
  });
};

export const createReportNotification = (title: string, message: string, actionUrl?: string) => {
  return addNotificationToMenu({
    title,
    message,
    type: 'info',
    category: 'report',
    priority: 'medium',
    actionUrl,
    actionText: 'Ver reporte',
    source: 'report'
  });
};

export const createBackupNotification = (action: 'created' | 'failed', format: 'excel' | 'pdf') => {
  const actions = {
    created: {
      title: 'Backup creado exitosamente',
      message: `Se ha creado un backup en formato ${format.toUpperCase()} con todos los datos del sistema`
    },
    failed: {
      title: 'Error al crear backup',
      message: `No se pudo crear el backup en formato ${format.toUpperCase()}`
    }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'created' ? 'success' : 'error',
    category: 'system',
    priority: 'high',
    actionUrl: '/dashboard',
    actionText: 'Ir al dashboard',
    source: 'backup'
  });
};

export const createDataDeletionNotification = (action: 'completed' | 'failed') => {
  const actions = {
    completed: {
      title: 'Datos eliminados exitosamente',
      message: 'Todos los datos no esenciales han sido eliminados del sistema'
    },
    failed: {
      title: 'Error al eliminar datos',
      message: 'No se pudieron eliminar todos los datos del sistema'
    }
  };

  return addNotificationToMenu({
    title: actions[action].title,
    message: actions[action].message,
    type: action === 'completed' ? 'warning' : 'error',
    category: 'system',
    priority: 'high',
    actionUrl: '/dashboard',
    actionText: 'Ir al dashboard',
    source: 'data-deletion'
  });
};
