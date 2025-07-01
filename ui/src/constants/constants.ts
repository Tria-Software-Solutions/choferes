export const ROUTES = {
  //Routes
  COURIER_SERVICE: "/courier-service",
  DASHBOARD: "/dashboard",
  EMPLOYEES: "/employees",
  LOGIN: "/",
  REGISTER: "register",
  ROLES: "/roles",
  SCHEDULES: "/schedules",
  SETTINGS: "/settings",
  VEHICLES: "/vehicles",
};

export const APPBAR_MENU = {
  //Menu items
  COURIER_SERVICE: "Mensajería",
  DASHBOARD: "Administración",
  EMPLOYEES: "Empleados",
  LOGOUT: "Cerrar Sesión",
  MANAGE: "Gestión",
  ROLES: "Roles",
  SCHEDULES: "Horarios",
  SETTINGS: "Configuración",
  TITLE: "Choferes de Alquiler",
  TITLE_SIMPLIFIED: "Choferes",
  VEHICLES: "Vehículos",
};

export const PAGE_TITLE = {
  //Pages titles
  COURIER_SERVICE: "Servicio de Mensajería",
  COURIER_SERVICE_SIMPLIFIED: "Mensajería",
  DASHBOARD: "Panel de Control Administrativo",
  DASHBOARD_SIMPLIFIED: "Administración",
  EMPLOYEES: "Gestión de Personal",
  EMPLOYEES_SIMPLIFIED: "Empleados",
  LOGIN: "Iniciar Sesión",
  REGISTER: "Crear Cuenta",
  ROLES: "Gestión de Roles",
  ROLES_SIMPLIFIED: "Roles",
  SCHEDULES: "Gestión de Horarios",
  SCHEDULES_SIMPLIFIED: "Horarios",
  SETTINGS: "Configuración del Sistema",
  VEHICLES: "Gestión de Vehículos",
  VEHICLES_SIMPLIFIED: "Vehículos",
};

export const PERMISSIONS = {
  //Permissions
  CREATE_EMPLOYEES: "Crear Empleado",
  CREATE_ROLE: "Crear Rol",
  CREATE_SCHEDULES: "Crear Horario",
  CREATE_VEHICLES: "Crear Vehículo",
  DELETE_EMPLOYEES: "Eliminar Empleado",
  DELETE_ROLE: "Eliminar Rol",
  DELETE_SCHEDULES: "Eliminar Horario",
  DELETE_VEHICLES: "Eliminar Vehículo",
  EDIT_EMPLOYEE_ROLES: "Editar Roles de Empleados",
  EDIT_EMPLOYEES: "Editar Empleado",
  EDIT_ROLE: "Editar Rol",
  EDIT_SCHEDULES: "Editar Horario",
  EDIT_USER: "Editar Usuario",
  EDIT_VEHICLES: "Editar Vehículo",
  ENABLE_DISABLE_USER: "Habilitar/Deshabilitar Usuario",
  EXPORT_EXCEL_EMPLOYEES: "Exportar Excel de Empleados",
  EXPORT_EXCEL_ROLES: "Exportar Excel de Roles de Empleados",
  EXPORT_EXCEL_SCHEDULES: "Exportar Excel de Horarios",
  EXPORT_EXCEL_VEHICLES: "Exportar Excel de Vehículos",
  EXPORT_PDF_EMPLOYEES: "Exportar PDF de Empleados",
  EXPORT_PDF_ROLES: "Exportar PDF de Roles de Empleados",
  EXPORT_PDF_SCHEDULES: "Exportar PDF de Horarios",
  EXPORT_PDF_VEHICLES: "Exportar PDF de Vehículos",
  VIEW_ADMIN: "Ver Admin",
  VIEW_COURIER_SERVICE: "Ver Mensajería",
  VIEW_EMPLOYEE_ROLES_HOURS: "Ver Horas de Empleados",
  VIEW_EMPLOYEES: "Ver Empleados",
  VIEW_ROLES: "Ver Roles",
  VIEW_SCHEDULES: "Ver Horarios",
  VIEW_VEHICLES: "Ver Vehículos",
};

export const DAYS_LIST = [
  //Weekdays
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export const OVERTIME = {
  //Overtime
  BIWEEKLY: 96,
  MONTHLY: 192,
  WEEKLY: 48,
};


export const COLORS_LIST = [
  //Colors
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
  //Brands
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
//States
  FREE: "Libre",
};

export const TABLE = {
  EDIT: "Editar",
  SAVE: "Guardar",
  CANCEL: "Cancelar",
  DELETE: "Eliminar",
  ACTIONS: "Acciones",
  NO_DATA: "No hay registros para mostrar",
  LOADING: "Cargando...",
  ROWS_PER_PAGE: "Filas por página",
  PAGE: "Página",
  OF: "de",
  PERMISSIONS_LABEL: "Permisos:",
  MORE: "+{n} más",
  SEARCH_PLACEHOLDER: "Buscar...",
  CONFIRM_DELETE_TITLE: "¿Eliminar registro?",
  CONFIRM_DELETE_TEXT: "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.",
  CONFIRM_DELETE_ACCEPT: "Sí, eliminar",
  CONFIRM_DELETE_CANCEL: "Cancelar",
  TOOLTIP_EDIT: "Editar",
  TOOLTIP_DELETE: "Eliminar",
  TOOLTIP_SAVE: "Guardar cambios",
  TOOLTIP_CANCEL: "Cancelar edición",
  TOOLTIP_PASSWORD: "Cambiar contraseña",
  TOOLTIP_STATUS: "Activar/Desactivar",
  ENABLE: "Activar",
  DISABLE: "Desactivar",
  CHANGE_PASSWORD: "Cambiar contraseña",
};

export const SELECTOR_TABLE = {
  PERIOD_WEEKLY: "Semanal",
  PERIOD_BIWEEKLY: "Quincenal",
  PERIOD_MONTHLY: "Mensual",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  WEEKS: "Semanas",
  WEEK: "Semana",
  BIWEEKS: "Quincenas",
  BIWEEK: "Quincena",
  EMPLOYEES: "Empleados",
  LOCATIONS: "Ubicaciones",
  SPECIAL_SCHEDULES: "Horarios Especiales",
  OTHER: "Otro",
  TOTAL_HOURS: "Horas totales",
  OVERTIME: "Horas extra",
  OVERTIME_HOURS: "Horas Extra",
  NO_EMPLOYEES: "No hay empleados para mostrar",
  ADJUST_TIME: "Ajustar tiempo",
  INFO: "Información",
  CLOSE: "Cerrar",
  ADJUST: "Ajustar",
  ADJUST_HOURS: "Ajuste de Horas",
  HOURS: "Horas",
  MINUTES: "Minutos",
  SEARCH_EMPLOYEE: "Buscar empleado...",
  SELECT_PERIOD: "Seleccionar periodo",
  TOOLTIP_INFO: "Ver información del empleado",
  TOOLTIP_ADJUST: "Ajustar horas trabajadas",
  WEEKLY_HOURS_MESSAGE: "Total de horas trabajadas en la semana:",
  BIWEEKLY_HOURS_MESSAGE: "Total de horas trabajadas en la quincena:",
  MONTHLY_HOURS_MESSAGE: "Total de horas trabajadas en el mes:",
  HOURS_TO_ADJUST: "Horas a ajustar",
  POSITIVE_NUMBER_REQUIRED: "Debe ser un número positivo",
  ADJUSTMENT_INFO: "Información de Ajuste",
  ADJUSTMENT_DESCRIPTION: "Ingresa la cantidad de horas a sumar o restar. Solo se permiten valores positivos.",
  CANCEL: "Cancelar",
  ADD: "Sumar",
  SUBTRACT: "Restar",
};

export const FORMS = {
  // Etiquetas y validaciones generales
  ALREADY_REGISTERED: "Ya está registrado",
  DAYS_REQUIRED: "Debe seleccionar al menos un día",
  DISTANCE_GREATER_0: "La distancia debe ser mayor a 0",
  DISTANCE_MAX_1000: "La distancia no puede ser mayor a 1000 km",
  EMAIL_EXISTS: "El correo electrónico ya existe",
  EMAIL_FORMAT: "El correo electrónico no tiene un formato válido",
  EMAIL_INVALID: "El correo electrónico no tiene un formato válido",
  EMAIL_REQUIRED: "El correo electrónico es requerido",
  FIRST_NAME: "Nombre",
  FIRST_NAME_REQUIRED: "El nombre es requerido",
  HOURS_INVALID: "Las horas deben ser un número entre 1 y 24",
  HOURS_REQUIRED: "Las horas son requeridas",
  INVALID_FORMAT_EXAMPLE: "Formato inválido. Ejemplo: 123ABC",
  INVALID_FORMAT_PARKING: "Formato inválido. Ejemplo: A-12",
  LABEL_REQUIRED: "Etiqueta requerida",
  LAST_NAME: "Apellido",
  LAST_NAME_REQUIRED: "El apellido es requerido",
  LETTERS_SPACES_HYPHENS: "Solo se permiten letras, espacios y guiones",
  LICENSE_PLATE_ALREADY_REGISTERED: "La placa ya está registrada",
  LOGIN_DESCRIPTION: "Ingresa tus credenciales para acceder al sistema",
  MAX_100_CHARS: "No puede tener más de 100 caracteres",
  MAX_30_CHARS: "No puede tener más de 30 caracteres",
  MAX_50_CHARS: "No puede tener más de 50 caracteres",
  MIN_2_CHARS: "Debe tener al menos 2 caracteres",
  MIN_3_CHARS: "Debe tener al menos 3 caracteres",
  NAME_LETTERS_ONLY: "Solo se permiten letras, espacios y guiones",
  PASSWORD_COMPLEXITY: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
  PASSWORD_INVALID: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
  PASSWORD_REQUIRED: "La contraseña es requerida",
  PASSWORDS_DONT_MATCH: "Las contraseñas no coinciden",
  PASSWORDS_REQUIRED: "Ambas contraseñas son requeridas",
  POSITIVE_NUMBER_ONLY: "Solo se permiten números positivos",
  REQUIRED_FIELD: "Este campo es requerido",
  ROLE_REQUIRED: "El rol es requerido",
  TRACKING_MAX_50: "No puede tener más de 50 caracteres",
  TRACKING_MIN_3: "Debe tener al menos 3 caracteres",
  USERNAME_EXISTS: "El nombre de usuario ya existe",
  USERNAME_FORMAT: "El usuario debe comenzar con una letra y tener entre 3 y 20 caracteres",
  USERNAME_INVALID: "El usuario debe comenzar con una letra y tener 3-20 caracteres",
  USERNAME_REQUIRED: "El usuario es requerido",
  USERNAME_START_LETTER: "El usuario debe comenzar con una letra",
};

export const NOTIFICATIONS = {
  // Success messages
  USER_CREATED: "Usuario creado exitosamente",
  USER_UPDATED: "Usuario actualizado exitosamente",
  USER_DELETED: "Usuario eliminado exitosamente",
  EMPLOYEE_CREATED: "El registro del empleado fue exitoso",
  EMPLOYEE_UPDATED: "La actualización del empleado fue exitosa",
  EMPLOYEE_DELETED: "Empleado eliminado exitosamente",
  SCHEDULE_CREATED: "El registro del horario fue exitoso",
  SCHEDULE_UPDATED: "La actualización del horario fue exitosa",
  SCHEDULE_DELETED: "Horario eliminado exitosamente",
  VEHICLE_CREATED: "El registro del vehículo fue exitoso",
  VEHICLE_UPDATED: "La actualización del vehículo fue exitosa",
  VEHICLE_DELETED: "Vehículo eliminado exitosamente",
  ROLE_CREATED: "El registro del rol fue exitoso",
  ROLE_UPDATED: "La actualización del rol fue exitosa",
  ROLE_DELETED: "Rol eliminado exitosamente",
  USER_REGISTERED: "El registro del usuario fue exitoso",
  DATA_UPDATED: "La actualización de lo datos fue exitosa",
  PASSWORD_UPDATED: "La actualización de la contraseña fue exitosa",
  
  // Error messages
  USER_CREATE_ERROR: "Error al crear el usuario",
  USER_UPDATE_ERROR: "Error al actualizar el usuario",
  USER_DELETE_ERROR: "Error al eliminar el usuario",
  EMPLOYEE_CREATE_ERROR: "Ha ocurrido un error al registrar el empleado",
  EMPLOYEE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el empleado",
  EMPLOYEE_DELETE_ERROR: "Error al eliminar el empleado",
  SCHEDULE_CREATE_ERROR: "Ha ocurrido un error al registrar el horario",
  SCHEDULE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el horario",
  SCHEDULE_DELETE_ERROR: "Error al eliminar el horario",
  VEHICLE_CREATE_ERROR: "Ha ocurrido un error al registrar el vehículo",
  VEHICLE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el vehículo",
  VEHICLE_DELETE_ERROR: "Error al eliminar el vehículo",
  ROLE_CREATE_ERROR: "Ha ocurrido un error al registrar el rol",
  ROLE_UPDATE_ERROR: "Ha ocurrido un error al actualizar el rol",
  ROLE_DELETE_ERROR: "Error al eliminar el rol",
  USER_REGISTER_ERROR: "Error al registrar usuario",
  USER_REGISTER_ERROR_DETAIL: "Ha ocurrido un error al registrar el usuario",
  DATA_UPDATE_ERROR: "Ha ocurrido un error al actualizar los datos",
  PASSWORD_UPDATE_ERROR: "Ha ocurrido un error al actualizar la contraseña",
  ROLE_NOT_FOUND: "Rol no encontrado",
  RETRY_MESSAGE: "Intenta de nuevo",
};

export const AUTH = {
  EMAIL_OR_USERNAME: "Correo Electrónico o Usuario",
  EMAIL_OR_USERNAME_REQUIRED: "El correo electrónico o usuario es requerido",
  PASSWORD: "Contraseña",
  LOGIN: "Iniciar Sesión",
  LOGGING_IN: "Iniciando Sesión...",
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
  SHOW_PASSWORD: "Mostrar contraseña",
  HIDE_PASSWORD: "Ocultar contraseña",
  REGISTER_DESCRIPTION: "Completa el formulario para crear una cuenta",
  REGISTER_SUCCESS: "El registro del usuario fue exitoso",
  REGISTER_ERROR: "Error al registrar usuario",
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

export const DASHBOARD = {
  USERS: "Usuarios",
  ROLES: "Roles",
  PERMISSIONS: "Permisos",
};

export const SNACKBAR = {
  CLOSE: "Cerrar",
};
