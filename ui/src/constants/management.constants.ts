const MANAGEMENT = {
  // Generic actions
  ADD: "Agregar",
  EDIT: "Editar",
  DELETE: "Eliminar",
  CANCEL: "Cancelar",
  SEARCH: "Buscar",
  EXPORT: "Exportar",
  CREATE_SUCCESS: "El registro fue exitoso",
  UPDATE_SUCCESS: "La actualización fue exitosa",
  DELETE_SUCCESS: "Elemento eliminado exitosamente",
  CREATE_ERROR: "Ha ocurrido un error al registrar",
  UPDATE_ERROR: "Ha ocurrido un error al actualizar",
  DELETE_ERROR: "Error al eliminar",
  LOADING: "Cargando...",

  // Employees Page
  EMPLOYEES_PAGE: {
    SEARCH_PLACEHOLDER: "Buscar empleado...",
    NO_EMPLOYEES: "No hay empleados registrados",
    DIALOG_DELETE_TITLE: "Eliminar empleado",
    DIALOG_DELETE_MESSAGE:
      "¿Estás seguro de que deseas eliminar este empleado?",
    DIALOG_DELETE_CONFIRM: "Eliminar",
    DIALOG_DELETE_CANCEL: "Cancelar",
    DIALOG_ADD_TITLE: "Agregar",
    DIALOG_ADD_SUBTITLE: "Nuevo empleado",
  },

  // Vehicles Page
  VEHICLES_PAGE: {
    SEARCH_PLACEHOLDER: "Buscar vehículo...",
    ADD: "Agregar vehículo",
    NO_VEHICLES: "No hay vehículos registrados",
    DATE_PICKER_LABEL: "Seleccionar fecha",
    TOOLTIP_PREV_DAY: "Día anterior",
    TOOLTIP_NEXT_DAY: "Día siguiente",
    TOOLTIP_CURRENT_DAY: "Hoy",
    DIALOG_DELETE_TITLE: "Eliminar vehículo",
    DIALOG_DELETE_MESSAGE:
      "¿Estás seguro de que deseas eliminar este vehículo?",
    DIALOG_DELETE_CONFIRM: "Eliminar",
    DIALOG_DELETE_CANCEL: "Cancelar",
    DIALOG_ADD_TITLE: "Agregar",
    DIALOG_ADD_SUBTITLE: "Nuevo vehículo",
  },

  // Courier Service Page
  COURIER_SERVICE_PAGE: {
    SEARCH_PLACEHOLDER: "Buscar servicio...",
    ADD: "Agregar servicio",
    NO_SERVICES: "No hay servicios registrados",
    DATE_PICKER_LABEL: "Seleccionar fecha",
    TOOLTIP_PREV_DAY: "Día anterior",
    TOOLTIP_NEXT_DAY: "Día siguiente",
    TOOLTIP_CURRENT_DAY: "Hoy",
    DIALOG_DELETE_TITLE: "Eliminar servicio",
    DIALOG_DELETE_MESSAGE:
      "¿Estás seguro de que deseas eliminar este servicio?",
    DIALOG_DELETE_CONFIRM: "Eliminar",
    DIALOG_DELETE_CANCEL: "Cancelar",
    DIALOG_ADD_TITLE: "Agregar",
    DIALOG_ADD_SUBTITLE: "Nuevo servicio",
  },

  // Schedules Page
  SCHEDULES_PAGE: {
    SEARCH_PLACEHOLDER: "Buscar horario...",
    ADD: "Agregar horario",
    NO_SCHEDULES: "No hay horarios registrados",
    DIALOG_DELETE_TITLE: "Eliminar horario",
    DIALOG_DELETE_MESSAGE: "¿Estás seguro de que deseas eliminar este horario?",
    DIALOG_DELETE_CONFIRM: "Eliminar",
    DIALOG_DELETE_CANCEL: "Cancelar",
    DIALOG_ADD_TITLE: "Agregar",
    DIALOG_ADD_SUBTITLE: "Nuevo horario",
  },

  // Roles Page
  ROLES_PAGE: {
    SEARCH_PLACEHOLDER: "Buscar empleado...",
    ADD: "Agregar rol",
    NO_ROLES: "No hay roles registrados",
    DIALOG_DELETE_TITLE: "Eliminar rol",
    DIALOG_DELETE_MESSAGE: "¿Estás seguro de que deseas eliminar este rol?",
    DIALOG_DELETE_CONFIRM: "Eliminar",
    DIALOG_DELETE_CANCEL: "Cancelar",
    DIALOG_ADD_TITLE: "Agregar rol",
    DIALOG_ADD_SUBTITLE: "Completa los datos para agregar un nuevo rol",
  },

  // Tabs and summaries
  TAB_WEEKLY: "Semanal",
  TAB_BIWEEKLY: "Quincenal",
  TAB_MONTHLY: "Mensual",
  TAB_OVERTIME: "Horas extra",
  SUMMARY_TITLE: "Resumen de horas trabajadas",
  SUMMARY_WEEKLY: "Horas semanales",
  SUMMARY_BIWEEKLY: "Horas quincenales",
  SUMMARY_MONTHLY: "Horas mensuales",
  SUMMARY_OVERTIME: "Horas extra",
  SUMMARY_DETAIL_OVERTIME: "Detalle de horas extra trabajadas",
  SUMMARY_INFO_TITLE: "Información de resumen",
  SUMMARY_INFO_DESC:
    "Aquí puedes ver el resumen de horas trabajadas por el empleado.",

  // Export dialogs
  DIALOG_EXPORT_TITLE: "Exportar datos",
  DIALOG_EXPORT_MESSAGE_EXCEL: "¿Deseas exportar los datos a Excel?",
  DIALOG_EXPORT_MESSAGE_PDF: "¿Deseas exportar los datos a PDF?",
  DIALOG_EXPORT_CONFIRM: "Exportar",
  DIALOG_EXPORT_CANCEL: "Cancelar",

  // Week navigation tooltips
  TOOLTIP_PREV_WEEK: "Semana anterior",
  TOOLTIP_NEXT_WEEK: "Semana siguiente",
  TOOLTIP_CURRENT_WEEK: "Semana actual",

  // Password change dialog
  DIALOG_PASSWORD_SUBTITLE: "Cambia tu contraseña de forma segura.",
  DIALOG_PASSWORD_NEW: "Nueva contraseña",
  DIALOG_PASSWORD_NEW_PLACEHOLDER: "Introduce la nueva contraseña",
  DIALOG_PASSWORD_CONFIRM: "Confirmar nueva contraseña",
  DIALOG_PASSWORD_CONFIRM_PLACEHOLDER: "Repite la nueva contraseña",
  DIALOG_PASSWORD_CANCEL: "Cancelar",
  DIALOG_PASSWORD_CHANGE: "Cambiar contraseña",

  // Settings page
  PERSONAL_INFO_TITLE: "Información personal",
  PERSONAL_INFO_DESC: "Actualiza tus datos personales aquí.",
  RECOMMENDATION_TITLE: "Recomendaciones",
  RECOMMENDATION_DESC:
    "Sigue las recomendaciones para mantener tu cuenta segura.",
  SAVE_CHANGES: "Guardar cambios",
  PASSWORD_TITLE: "Cambiar contraseña",
  PASSWORD_DESC: "Actualiza tu contraseña regularmente.",
  NEW_PASSWORD_LABEL: "Nueva contraseña",
  CONFIRM_NEW_PASSWORD_LABEL: "Confirmar nueva contraseña",
  SECURITY_TIP_TITLE: "Consejo de seguridad",
  SECURITY_TIP_DESC: "No compartas tu contraseña con nadie.",
  PASSWORD_INFO_TITLE: "Información de la contraseña",
  PASSWORD_INFO_DESC:
    "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial. Por seguridad, no compartas tu contraseña con nadie.",
  CHANGE_PASSWORD: "Cambiar contraseña",
  EMAIL_EXISTS: "El correo ya está registrado",
  USERNAME_EXISTS: "El nombre de usuario ya está registrado",
  PASSWORD_UPDATE_SUCCESS: "Contraseña actualizada exitosamente",
  PASSWORD_UPDATE_ERROR: "Error al actualizar la contraseña",

  // New top-level keys
  SEARCH_PLACEHOLDER: "Buscar...",
  NO_EMPLOYEES: "No hay empleados registrados",
  NO_SCHEDULES: "No hay horarios registrados",
  DIALOG_DELETE_TITLE: "Eliminar",
  DIALOG_DELETE_MESSAGE: "¿Estás seguro de que deseas eliminar este elemento?",
  DIALOG_DELETE_CONFIRM: "Eliminar",
  DIALOG_DELETE_CANCEL: "Cancelar",
  DIALOG_ADD_TITLE: "Agregar",
  DIALOG_ADD_SUBTITLE: "Completa los datos para agregar un nuevo elemento",
  DATE_PICKER_LABEL: "Seleccionar fecha",
};
export default MANAGEMENT;
