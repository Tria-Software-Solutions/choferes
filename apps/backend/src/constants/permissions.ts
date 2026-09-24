// Permission names as seeded in apps/backend/src/seeders/20250226195946-seed-auth.js
// Keep in sync with packages/shared/src/constants/permissions.ts (frontend source of truth)
export const PERMISSIONS = {
  VIEW_ROLES: "Ver Roles",
  VIEW_EMPLOYEE_HOURS: "Ver Horas de Empleados",
  EDIT_EMPLOYEE_ROLES: "Editar Roles de Empleados",
  EXPORT_EMPLOYEE_ROLES_EXCEL: "Exportar Excel de Roles de Empleados",
  EXPORT_EMPLOYEE_ROLES_PDF: "Exportar PDF de Roles de Empleados",

  VIEW_EMPLOYEES: "Ver Empleados",
  CREATE_EMPLOYEE: "Crear Empleado",
  EDIT_EMPLOYEE: "Editar Empleado",
  DELETE_EMPLOYEE: "Eliminar Empleado",
  EXPORT_EMPLOYEES_EXCEL: "Exportar Excel de Empleados",
  EXPORT_EMPLOYEES_PDF: "Exportar PDF de Empleados",

  VIEW_SCHEDULES: "Ver Horarios",
  CREATE_SCHEDULE: "Crear Horario",
  EDIT_SCHEDULE: "Editar Horario",
  DELETE_SCHEDULE: "Eliminar Horario",
  EXPORT_SCHEDULES_EXCEL: "Exportar Excel de Horarios",
  EXPORT_SCHEDULES_PDF: "Exportar PDF de Horarios",

  VIEW_VEHICLES: "Ver Vehículos",
  CREATE_VEHICLE: "Crear Vehículo",
  EDIT_VEHICLE: "Editar Vehículo",
  DELETE_VEHICLE: "Eliminar Vehículo",
  EXPORT_VEHICLES_EXCEL: "Exportar Excel de Vehículos",
  EXPORT_VEHICLES_PDF: "Exportar PDF de Vehículos",

  VIEW_ADMIN: "Ver Admin",
  EDIT_USER: "Editar Usuario",
  ENABLE_DISABLE_USER: "Habilitar/Deshabilitar Usuario",
  CREATE_ROLE: "Crear Rol",
  EDIT_ROLE: "Editar Rol",
  DELETE_ROLE: "Eliminar Rol",
  VIEW_MESSAGING: "Ver Mensajería",
  VIEW_USERS: "Ver Usuarios",
  CREATE_USER: "Crear Usuario",

  VIEW_WEEKLY_SUMMARY: "Ver Resumen Semanal",
  VIEW_BIWEEKLY_SUMMARY: "Ver Resumen Quincenal",
  VIEW_MONTHLY_SUMMARY: "Ver Resumen Mensual",
  EDIT_WEEKLY_SUMMARY: "Editar Resumen Semanal",
  EDIT_BIWEEKLY_SUMMARY: "Editar Resumen Quincenal",
  EDIT_MONTHLY_SUMMARY: "Editar Resumen Mensual",

  REORDER_SCHEDULES: "Reordenar Horarios",
  VIEW_COURIER: "Ver Courier",
  CREATE_COURIER: "Crear Courier",
  EDIT_COURIER: "Editar Courier",
  DELETE_COURIER: "Eliminar Courier",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
