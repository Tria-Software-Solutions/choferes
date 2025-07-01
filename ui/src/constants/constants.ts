export const ROUTES = {
  LOGIN: "/",
  REGISTER: "register",
  ROLES: "/roles",
  VEHICLES: "/vehicles",
  EMPLOYEES: "/employees",
  SCHEDULES: "/schedules",
  COURIER_SERVICE: "/courier-service",
  SETTINGS: "/settings",
  DASHBOARD: "/dashboard",
};

export const APPBAR_MENU = {
  TITLE: "Choferes de Alquiler",
  TITLE_SIMPLIFIED: "Choferes",
  ROLES: "Roles",
  VEHICLES: "Vehículos",
  MANAGE: "Gestión",
  EMPLOYEES: "Empleados",
  SCHEDULES: "Horarios",
  COURIER_SERVICE: "Mensajería",
  DASHBOARD: "Administración",
  SETTINGS: "Configuración",
  LOGOUT: "Cerrar Sesión",
};

export const PAGE_TITLE = {
  LOGIN: "Iniciar Sesión",
  REGISTER: "Crear Cuenta",
  COURIER_SERVICE: "Servicio de Mensajería",
  ROLES: "Gestión de Roles",
  VEHICLES: "Gestión de Vehículos",
  EMPLOYEES: "Gestión de Personal",
  SCHEDULES: "Gestión de Horarios",
  DASHBOARD: "Panel de Control Administrativo",
  SETTINGS: "Configuración del Sistema",
  ROLES_SIMPLIFIED: "Roles",
  VEHICLES_SIMPLIFIED: "Vehículos",
  EMPLOYEES_SIMPLIFIED: "Empleados",
  SCHEDULES_SIMPLIFIED: "Horarios",
  COURIER_SERVICE_SIMPLIFIED: "Mensajería",
  DASHBOARD_SIMPLIFIED: "Administración",
};

export const PERMISSIONS = {
  VIEW_COURIER_SERVICE: "Ver Mensajería",
  VIEW_ROLES: "Ver Roles",
  VIEW_EMPLOYEE_ROLES_HOURS: "Ver Horas de Empleados",
  EDIT_EMPLOYEE_ROLES: "Editar Roles de Empleados",
  EXPORT_EXCEL_ROLES: "Exportar Excel de Roles de Empleados",
  EXPORT_PDF_ROLES: "Exportar PDF de Roles de Empleados",
  VIEW_EMPLOYEES: "Ver Empleados",
  CREATE_EMPLOYEES: "Crear Empleado",
  EDIT_EMPLOYEES: "Editar Empleado",
  DELETE_EMPLOYEES: "Eliminar Empleado",
  EXPORT_EXCEL_EMPLOYEES: "Exportar Excel de Empleados",
  EXPORT_PDF_EMPLOYEES: "Exportar PDF de Empleados",
  VIEW_SCHEDULES: "Ver Horarios",
  CREATE_SCHEDULES: "Crear Horario",
  EDIT_SCHEDULES: "Editar Horario",
  DELETE_SCHEDULES: "Eliminar Horario",
  EXPORT_EXCEL_SCHEDULES: "Exportar Excel de Horarios",
  EXPORT_PDF_SCHEDULES: "Exportar PDF de Horarios",
  VIEW_VEHICLES: "Ver Vehículos",
  CREATE_VEHICLES: "Crear Vehículo",
  EDIT_VEHICLES: "Editar Vehículo",
  DELETE_VEHICLES: "Eliminar Vehículo",
  EXPORT_EXCEL_VEHICLES: "Exportar Excel de Vehículos",
  EXPORT_PDF_VEHICLES: "Exportar PDF de Vehículos",
  VIEW_ADMIN: "Ver Admin",
  EDIT_USER: "Editar Usuario",
  ENABLE_DISABLE_USER: "Habilitar/Deshabilitar Usuario",
  CREATE_ROLE: "Crear Rol",
  EDIT_ROLE: "Editar Rol",
  DELETE_ROLE: "Eliminar Rol",
};

export const DAYS_LIST = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export const OVERTIME = {
  WEEKLY: 48,
  BIWEEKLY: 96,
  MONTHLY: 192,
};

export const COLORS_LIST = [
  { value: "Blanco", label: "Blanco" },
  { value: "Negro", label: "Negro" },
  { value: "Gris", label: "Gris" },
  { value: "Azul", label: "Azul" },
  { value: "Rojo", label: "Rojo" },
  { value: "Verde", label: "Verde" },
  { value: "Amarillo", label: "Amarillo" },
  { value: "Naranja", label: "Naranja" },
  { value: "Café", label: "Café" },
  { value: "Plateado", label: "Plateado" },
  { value: "Dorado", label: "Dorado" },
  { value: "Vino", label: "Vino" },
  { value: "Beige", label: "Beige" },
  { value: "Morado", label: "Morado" },
  { value: "Turquesa", label: "Turquesa" },
  { value: "Púrpura", label: "Púrpura" },
  { value: "Celeste", label: "Celeste" },
  { value: "Bronce", label: "Bronce" },
  { value: "Champán", label: "Champán" },
];

export const BRANDS_LIST = [
  { value: "Acura", label: "Acura" },
  { value: "Alfa Romeo", label: "Alfa Romeo" },
  { value: "Aston Martin", label: "Aston Martin" },
  { value: "Audi", label: "Audi" },
  { value: "BMW", label: "BMW" },
  { value: "Bugatti", label: "Bugatti" },
  { value: "Buick", label: "Buick" },
  { value: "BYD", label: "BYD" },
  { value: "Cadillac", label: "Cadillac" },
  { value: "Changan", label: "Changan" },
  { value: "Chevrolet", label: "Chevrolet" },
  { value: "Chery", label: "Chery" },
  { value: "Chrysler", label: "Chrysler" },
  { value: "Citroën", label: "Citroën" },
  { value: "Dodge", label: "Dodge" },
  { value: "Dongfeng", label: "Dongfeng" },
  { value: "Ferrari", label: "Ferrari" },
  { value: "Fiat", label: "Fiat" },
  { value: "Ford", label: "Ford" },
  { value: "Foton", label: "Foton" },
  { value: "Geely", label: "Geely" },
  { value: "GMC", label: "GMC" },
  { value: "Great Wall", label: "Great Wall" },
  { value: "Haval", label: "Haval" },
  { value: "Honda", label: "Honda" },
  { value: "Hummer", label: "Hummer" },
  { value: "Hyundai", label: "Hyundai" },
  { value: "Infiniti", label: "Infiniti" },
  { value: "Isuzu", label: "Isuzu" },
  { value: "Jac", label: "Jac" },
  { value: "Jaguar", label: "Jaguar" },
  { value: "Jeep", label: "Jeep" },
  { value: "Kia", label: "Kia" },
  { value: "Land Rover", label: "Land Rover" },
  { value: "Lamborghini", label: "Lamborghini" },
  { value: "Lexus", label: "Lexus" },
  { value: "Lincoln", label: "Lincoln" },
  { value: "Lucid", label: "Lucid" },
  { value: "Maserati", label: "Maserati" },
  { value: "Mazda", label: "Mazda" },
  { value: "McLaren", label: "McLaren" },
  { value: "Mercedes-Benz", label: "Mercedes-Benz" },
  { value: "MG", label: "MG" },
  { value: "Mini", label: "Mini" },
  { value: "Mitsubishi", label: "Mitsubishi" },
  { value: "Nissan", label: "Nissan" },
  { value: "Pagani", label: "Pagani" },
  { value: "Peugeot", label: "Peugeot" },
  { value: "Porsche", label: "Porsche" },
  { value: "Ram", label: "Ram" },
  { value: "Renault", label: "Renault" },
  { value: "Rivian", label: "Rivian" },
  { value: "Rolls-Royce", label: "Rolls-Royce" },
  { value: "Saab", label: "Saab" },
  { value: "Seat", label: "Seat" },
  { value: "Subaru", label: "Subaru" },
  { value: "Suzuki", label: "Suzuki" },
  { value: "Tesla", label: "Tesla" },
  { value: "Toyota", label: "Toyota" },
  { value: "Volkswagen", label: "Volkswagen" },
  { value: "Volvo", label: "Volvo" },
  { value: "Wuling", label: "Wuling" },
  { value: "Xpeng", label: "Xpeng" },
];

export const STATE = {
  FREE: "Libre",
};

export const TABLE = {
  ROWS_PER_PAGE: "Filas por página",
};

export const SELECTOR_TABLE = {
  // Headers
  EMPLOYEES: "Empleados",
  
  // Period options
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal", 
  MONTHLY: "Mensual",
  
  // Period labels
  WEEKS: "Semanas",
  WEEK: "Semana",
  BIWEEKS: "Quincenas",
  BIWEEK: "Quincena",
  
  // Menu sections
  LOCATIONS: "Ubicaciones",
  SPECIAL_SCHEDULES: "Horarios Especiales",
  OTHER: "Otro",
  
  // Hours display
  HOURS: "horas",
  OVERTIME_HOURS: "Horas Extra",
  
  // Dialog titles and content
  ADJUST_HOURS: "Ajuste de Horas",
  HOURS_TO_ADJUST: "Horas a ajustar",
  ADJUSTMENT_INFO: "Información de Ajuste",
  ADJUSTMENT_DESCRIPTION: "Ingresa la cantidad de horas a sumar o restar. Solo se permiten valores positivos.",
  
  // Dialog messages
  WEEKLY_HOURS_MESSAGE: "Total de horas trabajadas en la semana:",
  BIWEEKLY_HOURS_MESSAGE: "Total de horas trabajadas en la quincena:",
  MONTHLY_HOURS_MESSAGE: "Total de horas trabajadas en el mes:",
  
  // Validation messages
  POSITIVE_NUMBER_REQUIRED: "Debe ser un número positivo",
  
  // Buttons
  CANCEL: "Cancelar",
  ADD: "Sumar",
  SUBTRACT: "Restar",
  
  // Date format helpers
  FROM: "del",
  TO: "al",
};

export const FORMS = {
  // Common validation messages
  REQUIRED_FIELD: "Este campo es requerido",
  POSITIVE_NUMBER_ONLY: "Solo se permiten números",
  ALREADY_REGISTERED: "Este elemento ya está registrado",
  MIN_LENGTH: "Debe tener al menos {min} caracteres",
  MAX_LENGTH: "Debe tener máximo {max} caracteres",
  INVALID_FORMAT: "Formato inválido",
  
  // Common buttons
  ADD: "Agregar",
  ADDING: "Agregando...",
  SAVE: "Guardar",
  SAVING: "Guardando...",
  CANCEL: "Cancelar",
  DELETE: "Eliminar",
  DELETING: "Eliminando...",
  EDIT: "Editar",
  EDITING: "Editando...",
  
  // Courier form
  DRIVER: "Chofer",
  DRIVER_REQUIRED: "El nombre del chofer es requerido",
  DRIVER_MIN_LENGTH: "El nombre debe tener al menos 2 caracteres",
  DRIVER_MAX_LENGTH: "El nombre debe tener máximo 100 caracteres",
  DRIVER_INVALID_FORMAT: "El nombre solo puede contener letras y espacios",
  
  ROUTE: "Ruta",
  ROUTE_REQUIRED: "La ruta es requerida",
  ROUTE_OPTIONS: {
    GAM: "GAM",
    GAM_EXPRESS: "GAM Express",
    RURAL: "Rural",
  },
  
  DISTANCE: "Distancia",
  DISTANCE_INVALID: "La distancia debe ser mayor a 0",
  DISTANCE_MAX: "La distancia no puede ser mayor a 1000 km",
  
  TRACKING_NUMBER: "Número de Guía",
  TRACKING_NUMBER_REQUIRED: "El número de guía es requerido",
  TRACKING_NUMBER_MIN_LENGTH: "El número de guía debe tener al menos 3 caracteres",
  TRACKING_NUMBER_MAX_LENGTH: "El número de guía debe tener máximo 50 caracteres",
  
  STATUS: "Estado",
  STATUS_REQUIRED: "El estado es requerido",
  STATUS_OPTIONS: {
    DISPATCHED: "Despachado",
    IN_TRANSIT: "En Tránsito",
    DELIVERED: "Entregado",
  },
  
  // Role form
  ROLE_NAME: "Nombre del Rol",
  ROLE_NAME_REQUIRED: "El nombre del rol es requerido",
  PERMISSIONS: "Permisos",
  PERMISSIONS_REQUIRED: "Debe seleccionar al menos un permiso",
  
  // Vehicle form
  TICKET: "Boleta",
  TICKET_NUMBERS_ONLY: "Solo se permiten números",
  TICKET_ALREADY_REGISTERED: "Este número de boleta ya está registrado",
  LICENSE_PLATE: "Placa",
  LICENSE_PLATE_ALREADY_REGISTERED: "Esta placa ya está registrada",
};

export const AUTH = {
  // Login
  EMAIL_OR_USERNAME: "Correo Electrónico o Usuario",
  EMAIL_OR_USERNAME_REQUIRED: "El correo electrónico o usuario es requerido",
  PASSWORD: "Contraseña",
  PASSWORD_REQUIRED: "La contraseña es requerida",
  LOGIN: "Iniciar Sesión",
  LOGGING_IN: "Iniciando Sesión...",
  
  // Settings
  PERSONAL_INFO: "Información Personal",
  PERSONAL_INFO_DESCRIPTION: "Actualiza tu información personal y credenciales de acceso",
  FIRST_NAME: "Nombre",
  LAST_NAME: "Apellido",
  EMAIL: "Correo electrónico",
  USERNAME: "Usuario",
  UPDATE_PERSONAL_INFO: "Actualizar Información Personal",
  UPDATING_PERSONAL_INFO: "Actualizando...",
  PERSONAL_INFO_SUCCESS: "La actualización de lo datos fue exitosa",
  PERSONAL_INFO_ERROR: "Ha ocurrido un error al actualizar los datos",
  
  CHANGE_PASSWORD: "Cambiar Contraseña",
  CHANGE_PASSWORD_DESCRIPTION: "Actualiza tu contraseña para mantener tu cuenta segura",
  NEW_PASSWORD: "Nueva contraseña",
  CONFIRM_NEW_PASSWORD: "Confirmar nueva contraseña",
  UPDATE_PASSWORD: "Actualizar Contraseña",
  UPDATING_PASSWORD: "Actualizando...",
  PASSWORD_SUCCESS: "La actualización de la contraseña fue exitosa",
  PASSWORD_ERROR: "Ha ocurrido un error al actualizar la contraseña",
  
  // Common
  SHOW_PASSWORD: "Mostrar contraseña",
  HIDE_PASSWORD: "Ocultar contraseña",
};

export const MANAGEMENT = {
  // Common actions
  ADD: "Agregar",
  EDIT: "Editar",
  DELETE: "Eliminar",
  CANCEL: "Cancelar",
  SEARCH: "Buscar",
  EXPORT: "Exportar",
  
  // Success messages
  CREATE_SUCCESS: "El registro fue exitoso",
  UPDATE_SUCCESS: "La actualización fue exitosa",
  DELETE_SUCCESS: "Elemento eliminado exitosamente",
  
  // Error messages
  CREATE_ERROR: "Ha ocurrido un error al registrar",
  UPDATE_ERROR: "Ha ocurrido un error al actualizar",
  DELETE_ERROR: "Error al eliminar",
  
  // Employees
  EMPLOYEES: "Empleados",
  EMPLOYEE: "Empleado",
  NEW_EMPLOYEE: "Nuevo empleado",
  SEARCH_EMPLOYEE: "Buscar empleado",
  DELETE_EMPLOYEE: "Eliminar Empleado",
  EMPLOYEE_CREATE_SUCCESS: "El registro del empleado fue exitoso",
  EMPLOYEE_CREATE_ERROR: "Ha ocurrido un error al registrar el empleado",
  EMPLOYEE_UPDATE_SUCCESS: "La actualización del empleado fue exitosa",
  EMPLOYEE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el empleado",
  EMPLOYEE_DELETE_SUCCESS: "Empleado eliminado exitosamente",
  EMPLOYEE_DELETE_ERROR: "Error al eliminar el empleado",
  
  // Schedules
  SCHEDULES: "Horarios",
  SCHEDULE: "Horario",
  NEW_SCHEDULE: "Nuevo horario",
  SEARCH_SCHEDULE: "Buscar horario",
  DELETE_SCHEDULE: "Eliminar Horario",
  SCHEDULE_CREATE_SUCCESS: "El registro del horario fue exitoso",
  SCHEDULE_CREATE_ERROR: "Ha ocurrido un error al registrar el horario",
  SCHEDULE_UPDATE_SUCCESS: "La actualización del horario fue exitosa",
  SCHEDULE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el horario",
  SCHEDULE_DELETE_SUCCESS: "Horario eliminado exitosamente",
  SCHEDULE_DELETE_ERROR: "Error al eliminar el horario",
  
  // Vehicles
  VEHICLES: "Vehículos",
  VEHICLE: "Vehículo",
  NEW_VEHICLE: "Nuevo vehículo",
  SEARCH_VEHICLE: "Buscar vehículo",
  DELETE_VEHICLE: "Eliminar Vehículo",
  VEHICLE_CREATE_SUCCESS: "El registro del vehículo fue exitoso",
  VEHICLE_CREATE_ERROR: "Ha ocurrido un error al registrar el vehículo",
  VEHICLE_UPDATE_SUCCESS: "La actualización del vehículo fue exitosa",
  VEHICLE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el vehículo",
  VEHICLE_DELETE_SUCCESS: "Vehículo eliminado exitosamente",
  VEHICLE_DELETE_ERROR: "Error al eliminar el vehículo",
  
  // Roles
  ROLES: "Roles",
  ROLE: "Rol",
  NEW_ROLE: "Nuevo rol",
  SEARCH_ROLE: "Buscar rol",
  DELETE_ROLE: "Eliminar Rol",
  ROLE_CREATE_SUCCESS: "El registro del rol fue exitoso",
  ROLE_CREATE_ERROR: "Ha ocurrido un error al registrar el rol",
  ROLE_UPDATE_SUCCESS: "La actualización del rol fue exitosa",
  ROLE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el rol",
  ROLE_DELETE_SUCCESS: "Rol eliminado exitosamente",
  ROLE_DELETE_ERROR: "Error al eliminar el rol",
  
  // Common UI
  NO_RESULTS: "No se encontraron resultados",
  NO_RESULTS_DESCRIPTION: "Intenta ajustar los filtros de búsqueda",
  LOADING: "Cargando...",
};

export const ERRORS = {
  // Error page
  ERROR_TITLE: "¡Oops! Algo salió mal",
  ERROR_SUBTITLE: "Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.",
  ERROR_CODE: "Código de Error",
  GO_HOME: "Ir al Inicio",
  RELOAD: "Recargar",
  CONTACT_SUPPORT: "Si el problema persiste, contacta a soporte técnico",
  
  // Forbidden page
  FORBIDDEN_TITLE: "Acceso Denegado",
  FORBIDDEN_SUBTITLE: "No tienes permisos para acceder a esta página. Contacta a tu administrador si crees que esto es un error.",
  ACCESS_DENIED: "Acceso Denegado",
  CONTACT_ADMIN: "Contacta a tu administrador",
  
  // Not Found page
  NOT_FOUND_TITLE: "Página No Encontrada",
  NOT_FOUND_SUBTITLE: "La página que buscas no existe o ha sido movida.",
  PAGE_NOT_FOUND: "Página No Encontrada",
  
  // Session Expired
  SESSION_EXPIRED_TITLE: "Sesión Expirada",
  SESSION_EXPIRED_SUBTITLE: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
  SESSION_EXPIRED: "Sesión Expirada",
  LOGIN_AGAIN: "Iniciar Sesión Nuevamente",
};

export const DIALOG = {
  // Button texts
  DELETE: "Eliminar",
  CONTINUE: "Continuar",
  ACCEPT: "Aceptar",
  CONFIRM: "Confirmar",
  CANCEL: "Cancelar",
  
  // Common actions
  CLOSE: "Cerrar",
  SAVE: "Guardar",
  UPDATE: "Actualizar",
  
  // Confirmation messages
  CONFIRM_DELETE: "¿Estás seguro de que deseas eliminar este elemento?",
  CONFIRM_ACTION: "¿Estás seguro de que deseas realizar esta acción?",
  
  // Success messages
  SUCCESS_TITLE: "Operación Exitosa",
  SUCCESS_MESSAGE: "La operación se completó correctamente",
  
  // Warning messages
  WARNING_TITLE: "Advertencia",
  WARNING_MESSAGE: "Esta acción no se puede deshacer",
  
  // Info messages
  INFO_TITLE: "Información",
  INFO_MESSAGE: "Información importante",
};

export const TABLE_UI = {
  // Common table actions
  EDIT: "Editar",
  DELETE: "Eliminar",
  VIEW: "Ver",
  VIEW_MORE: "Ver más",
  VIEW_LESS: "Ver menos",
  
  // Table headers
  ACTIONS: "Acciones",
  NO_DATA: "No hay datos disponibles",
  LOADING_DATA: "Cargando datos...",
  
  // Pagination
  ROWS_PER_PAGE: "Filas por página",
  OF: "de",
  SHOWING: "Mostrando",
  TO: "a",
  ENTRIES: "registros",
  
  // Sorting
  SORT_ASC: "Ordenar ascendente",
  SORT_DESC: "Ordenar descendente",
  
  // Selection
  SELECT_ALL: "Seleccionar todo",
  DESELECT_ALL: "Deseleccionar todo",
  SELECTED: "seleccionados",
  
  // Filters
  FILTER: "Filtrar",
  CLEAR_FILTERS: "Limpiar filtros",
  SEARCH: "Buscar",
  SEARCH_PLACEHOLDER: "Buscar...",
  
  // Export
  EXPORT_EXCEL: "Exportar a Excel",
  EXPORT_PDF: "Exportar a PDF",
  EXPORT_CSV: "Exportar a CSV",
  
  // Status
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  ENABLED: "Habilitado",
  DISABLED: "Deshabilitado",
  
  // Common fields
  NAME: "Nombre",
  DESCRIPTION: "Descripción",
  CREATED_AT: "Creado el",
  UPDATED_AT: "Actualizado el",
  STATUS: "Estado",
};
