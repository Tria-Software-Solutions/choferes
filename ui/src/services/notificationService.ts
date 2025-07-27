import { Notification } from '../models/Notification';

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
    actionText: 'Ver empleados'
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
    actionText: 'Ver horarios'
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
    actionText: 'Ver vehículos'
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
    actionText: 'Ver servicios'
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
      actionText: 'Ver resultados'
    });
  } else {
    return addNotificationToMenu({
      title: 'Error al generar horas',
      message: 'Hubo un problema al generar las horas automáticamente',
      type: 'error',
      category: 'report',
      priority: 'high',
      actionUrl: '/roles',
      actionText: 'Reintentar'
    });
  }
};

export const createSystemNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
  return addNotificationToMenu({
    title,
    message,
    type,
    category: 'system',
    priority: 'low'
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
    actionText: 'Ver reporte'
  });
}; 