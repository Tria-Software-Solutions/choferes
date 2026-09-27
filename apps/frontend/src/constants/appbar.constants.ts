const APPBAR_MENU = {
  DASHBOARD: "Reportes",
  EMPLOYEES: "Gestión de Empleados",
  LOGOUT: "Cerrar Sesión",
  MANAGE: "Gestión",
  ROLES: "Administración de Roles",
  SCHEDULES: "Gestión de Horarios y Turnos",
  TASKS: "Tareas",
  PROFILE: "Configuración",
  TITLE: "Choferes de Alquiler",
  TITLE_SIMPLIFIED: "Choferes",
  VEHICLES: "Gestión de Vehículos y Parqueo",
  NO_LINKS: "No hay links disponibles",
  NOTIFICATIONS: "Notificaciones",
  USER_MENU: "Menú de Usuario",
};

// Short labels for the top navigation bar. The long labels above stay as the
// stable keys of the user's saved menu preferences, so renaming a page means
// changing only its short label here.
export const NAV_SHORT_LABELS: Record<string, string> = {
  [APPBAR_MENU.ROLES]: "Roles",
  [APPBAR_MENU.DASHBOARD]: "Reportes",
  [APPBAR_MENU.VEHICLES]: "Vehículos",
  [APPBAR_MENU.EMPLOYEES]: "Planilla",
  [APPBAR_MENU.SCHEDULES]: "Horarios",
  [APPBAR_MENU.TASKS]: "Tareas",
  [APPBAR_MENU.PROFILE]: "Configuración",
};

export default APPBAR_MENU;
