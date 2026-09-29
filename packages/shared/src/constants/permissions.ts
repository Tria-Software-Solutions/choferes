/**
 * ─── Single source of truth for the permission catalog ────────────────────────
 *
 * Every permission is defined once here and consumed by:
 *  - the backend (route guards authorize by `code`)
 *  - the seeders / migrations (they store `code`, `module` and `label` in the DB)
 *  - the frontend (renders `label` and groups by `module`)
 *
 * Rules:
 *  - `code` is the STABLE machine identity. It never changes and is what the
 *    server authorizes against. Format: `<module>:<action>` where `<module>` is
 *    always a plural English resource (`employees`, `schedules`, `users`...).
 *  - `label` is the Spanish display name shown to users. It must read like
 *    natural Spanish — no underscores, no raw codes, no technical jargon.
 *  - `module` groups permissions in the UI (roles editor, permissions list).
 *
 * The `PERMISSIONS` map (key -> label) is kept as the public API used across the
 * frontend, so UI code reads `PERMISSIONS.VIEW_ROLES` instead of raw strings.
 */
export type PermissionModule =
  | "Mi Panel"
  | "Empleados"
  | "Roles"
  | "Horarios"
  | "Vehículos"
  | "Resúmenes"
  | "Pagos"
  | "Vacaciones"
  | "Licencias"
  | "Amonestaciones"
  | "Tareas"
  | "Usuarios"
  | "Administración"
  | "Perfil"
  | "Notificaciones";

export interface PermissionDefinition {
  readonly code: string;
  readonly module: PermissionModule;
  readonly label: string;
}

export const PERMISSION_CATALOG = {
  // ── Mi Panel (autoservicio) ──────────────────────────────────────────────────
  VIEW_MY_PANEL: { code: "my-panel:view", module: "Mi Panel", label: "Ver Mi Panel" },

  // ── Empleados ────────────────────────────────────────────────────────────────
  VIEW_EMPLOYEES: { code: "employees:view", module: "Empleados", label: "Ver Empleados" },
  CREATE_EMPLOYEES: { code: "employees:create", module: "Empleados", label: "Crear Empleado" },
  EDIT_EMPLOYEES: { code: "employees:edit", module: "Empleados", label: "Editar Empleado" },
  DELETE_EMPLOYEES: { code: "employees:delete", module: "Empleados", label: "Eliminar Empleado" },
  EXPORT_EMPLOYEES: { code: "employees:export", module: "Empleados", label: "Exportar Empleados" },

  // ── Roles y horas de empleados ───────────────────────────────────────────────
  VIEW_ROLES: { code: "roles:view", module: "Roles", label: "Ver Roles" },
  CREATE_ROLE: { code: "roles:create", module: "Roles", label: "Crear Rol" },
  EDIT_ROLE: { code: "roles:edit", module: "Roles", label: "Editar Rol" },
  DELETE_ROLE: { code: "roles:delete", module: "Roles", label: "Eliminar Rol" },
  EXPORT_ROLES: { code: "roles:export", module: "Roles", label: "Exportar Roles" },
  VIEW_EMPLOYEE_HOURS: {
    code: "employee-hours:view",
    module: "Roles",
    label: "Ver Horas de Empleados",
  },
  EDIT_EMPLOYEE_HOURS: {
    code: "employee-hours:edit",
    module: "Roles",
    label: "Editar Horas de Empleados",
  },

  // ── Horarios ─────────────────────────────────────────────────────────────────
  VIEW_SCHEDULES: { code: "schedules:view", module: "Horarios", label: "Ver Horarios" },
  CREATE_SCHEDULES: { code: "schedules:create", module: "Horarios", label: "Crear Horario" },
  EDIT_SCHEDULES: { code: "schedules:edit", module: "Horarios", label: "Editar Horario" },
  DELETE_SCHEDULES: { code: "schedules:delete", module: "Horarios", label: "Eliminar Horario" },
  REORDER_SCHEDULES: { code: "schedules:reorder", module: "Horarios", label: "Reordenar Horarios" },
  EXPORT_SCHEDULES: { code: "schedules:export", module: "Horarios", label: "Exportar Horarios" },

  // ── Vehículos ────────────────────────────────────────────────────────────────
  VIEW_VEHICLES: { code: "vehicles:view", module: "Vehículos", label: "Ver Vehículos" },
  CREATE_VEHICLES: { code: "vehicles:create", module: "Vehículos", label: "Crear Vehículo" },
  EDIT_VEHICLES: { code: "vehicles:edit", module: "Vehículos", label: "Editar Vehículo" },
  DELETE_VEHICLES: { code: "vehicles:delete", module: "Vehículos", label: "Eliminar Vehículo" },
  EXPORT_VEHICLES: { code: "vehicles:export", module: "Vehículos", label: "Exportar Vehículos" },

  // ── Resúmenes ────────────────────────────────────────────────────────────────
  VIEW_WEEKLY_SUMMARY: {
    code: "weekly-summaries:view",
    module: "Resúmenes",
    label: "Ver Resumen Semanal",
  },
  EDIT_WEEKLY_SUMMARY: {
    code: "weekly-summaries:edit",
    module: "Resúmenes",
    label: "Editar Resumen Semanal",
  },
  VIEW_BIWEEKLY_SUMMARY: {
    code: "biweekly-summaries:view",
    module: "Resúmenes",
    label: "Ver Resumen Quincenal",
  },
  EDIT_BIWEEKLY_SUMMARY: {
    code: "biweekly-summaries:edit",
    module: "Resúmenes",
    label: "Editar Resumen Quincenal",
  },
  VIEW_MONTHLY_SUMMARY: {
    code: "monthly-summaries:view",
    module: "Resúmenes",
    label: "Ver Resumen Mensual",
  },
  EDIT_MONTHLY_SUMMARY: {
    code: "monthly-summaries:edit",
    module: "Resúmenes",
    label: "Editar Resumen Mensual",
  },

  // ── Pagos ────────────────────────────────────────────────────────────────────
  VIEW_PAYMENTS: { code: "payments:view", module: "Pagos", label: "Ver Pagos" },
  CREATE_PAYMENT: { code: "payments:create", module: "Pagos", label: "Crear Pago" },
  EDIT_PAYMENT: { code: "payments:edit", module: "Pagos", label: "Editar Pago" },
  DELETE_PAYMENT: { code: "payments:delete", module: "Pagos", label: "Eliminar Pago" },
  SEND_PAYMENT_EMAIL: {
    code: "payments:send-email",
    module: "Pagos",
    label: "Enviar Pago por Correo",
  },

  // ── Vacaciones ───────────────────────────────────────────────────────────────
  VIEW_VACATIONS: { code: "vacations:view", module: "Vacaciones", label: "Ver Vacaciones" },
  CREATE_VACATION: { code: "vacations:create", module: "Vacaciones", label: "Crear Vacación" },
  EDIT_VACATION: { code: "vacations:edit", module: "Vacaciones", label: "Editar Vacación" },
  DELETE_VACATION: { code: "vacations:delete", module: "Vacaciones", label: "Eliminar Vacación" },
  REQUEST_VACATION: {
    code: "vacations:request",
    module: "Vacaciones",
    label: "Solicitar Mis Vacaciones",
  },

  // ── Licencias de conducir ────────────────────────────────────────────────────
  VIEW_LICENSES: { code: "licenses:view", module: "Licencias", label: "Ver Licencias" },
  CREATE_LICENSE: { code: "licenses:create", module: "Licencias", label: "Crear Licencia" },
  EDIT_LICENSE: { code: "licenses:edit", module: "Licencias", label: "Editar Licencia" },
  DELETE_LICENSE: { code: "licenses:delete", module: "Licencias", label: "Eliminar Licencia" },

  // ── Amonestaciones / llamadas de atención ────────────────────────────────────
  VIEW_DISCIPLINARY: {
    code: "disciplinary-actions:view",
    module: "Amonestaciones",
    label: "Ver Amonestaciones",
  },
  CREATE_DISCIPLINARY: {
    code: "disciplinary-actions:create",
    module: "Amonestaciones",
    label: "Crear Amonestación",
  },
  EDIT_DISCIPLINARY: {
    code: "disciplinary-actions:edit",
    module: "Amonestaciones",
    label: "Editar Amonestación",
  },
  DELETE_DISCIPLINARY: {
    code: "disciplinary-actions:delete",
    module: "Amonestaciones",
    label: "Eliminar Amonestación",
  },

  // ── Tareas ───────────────────────────────────────────────────────────────────
  VIEW_TASKS: { code: "tasks:view", module: "Tareas", label: "Ver Tareas" },
  CREATE_TASK: { code: "tasks:create", module: "Tareas", label: "Crear Tarea" },
  EDIT_TASK: { code: "tasks:edit", module: "Tareas", label: "Editar Tarea" },
  DELETE_TASK: { code: "tasks:delete", module: "Tareas", label: "Eliminar Tarea" },

  // ── Usuarios y administración ────────────────────────────────────────────────
  VIEW_USERS: { code: "users:view", module: "Usuarios", label: "Ver Usuarios" },
  CREATE_USERS: { code: "users:create", module: "Usuarios", label: "Crear Usuario" },
  EDIT_USER: { code: "users:edit", module: "Usuarios", label: "Editar Usuario" },
  DELETE_USER: { code: "users:delete", module: "Usuarios", label: "Eliminar Usuario" },
  ENABLE_DISABLE_USER: {
    code: "users:toggle-active",
    module: "Usuarios",
    label: "Habilitar o Deshabilitar Usuario",
  },
  VIEW_ADMIN: {
    code: "admin:view",
    module: "Administración",
    label: "Ver Panel de Administración",
  },

  // ── Perfil (autoservicio) ────────────────────────────────────────────────────
  VIEW_PROFILE: { code: "profile:view", module: "Perfil", label: "Ver Mi Perfil" },
  EDIT_PROFILE: { code: "profile:edit", module: "Perfil", label: "Editar Mi Perfil" },

  // ── Notificaciones (autoservicio) ────────────────────────────────────────────
  VIEW_NOTIFICATIONS: {
    code: "notifications:view",
    module: "Notificaciones",
    label: "Ver Notificaciones",
  },
  EDIT_NOTIFICATIONS: {
    code: "notifications:edit",
    module: "Notificaciones",
    label: "Marcar Notificaciones como Leídas",
  },
  DELETE_NOTIFICATIONS: {
    code: "notifications:delete",
    module: "Notificaciones",
    label: "Eliminar Notificaciones",
  },
} as const;

export type PermissionKey = keyof typeof PERMISSION_CATALOG;

type LabelOf<K extends PermissionKey> = (typeof PERMISSION_CATALOG)[K]["label"];
type CodeOf<K extends PermissionKey> = (typeof PERMISSION_CATALOG)[K]["code"];

/** Flat list of every permission definition (DB seeding, validation, tests). */
export const PERMISSION_DEFINITIONS: readonly PermissionDefinition[] =
  Object.values(PERMISSION_CATALOG);

/** key -> Spanish display label. Public UI API: `PERMISSIONS.VIEW_ROLES`. */
export const PERMISSIONS = Object.fromEntries(
  Object.entries(PERMISSION_CATALOG).map(([key, def]) => [key, def.label]),
) as { [K in PermissionKey]: LabelOf<K> };

/** key -> stable authorization code. Server-side API: `PERMISSION_CODES.VIEW_PAYMENTS`. */
export const PERMISSION_CODES = Object.fromEntries(
  Object.entries(PERMISSION_CATALOG).map(([key, def]) => [key, def.code]),
) as { [K in PermissionKey]: CodeOf<K> };

/** All stable codes, in catalog order. */
export const ALL_PERMISSION_CODES: readonly string[] = PERMISSION_DEFINITIONS.map(
  (def) => def.code,
);

/** Module order used to render grouped permission lists in the UI. */
export const PERMISSION_MODULE_ORDER: readonly PermissionModule[] = [
  "Mi Panel",
  "Empleados",
  "Roles",
  "Horarios",
  "Vehículos",
  "Resúmenes",
  "Pagos",
  "Vacaciones",
  "Licencias",
  "Amonestaciones",
  "Tareas",
  "Usuarios",
  "Administración",
  "Perfil",
  "Notificaciones",
];

const CODES_BY_SET = new Set<string>(ALL_PERMISSION_CODES);
const DEFINITION_BY_CODE = new Map<string, PermissionDefinition>(
  PERMISSION_DEFINITIONS.map((def) => [def.code, def]),
);

/** Type guard for a valid, catalogued permission code. */
export const isPermissionCode = (code: unknown): code is string =>
  typeof code === "string" && CODES_BY_SET.has(code);

/** Returns the definition for a code, or undefined when unknown. */
export const getPermissionByCode = (code: string): PermissionDefinition | undefined =>
  DEFINITION_BY_CODE.get(code);

/**
 * Permisos de autoservicio: lo que necesita cualquier persona con cuenta para
 * usar Mi Panel, su perfil, sus notificaciones, sus tareas y pedir vacaciones.
 * Es la base de todos los roles operativos.
 */
const SELF_SERVICE_PERMISSIONS = [
  "my-panel:view",
  "profile:view",
  "profile:edit",
  "notifications:view",
  "notifications:edit",
  "notifications:delete",
  "tasks:view",
  "tasks:create",
  "tasks:edit",
  "tasks:delete",
  "vacations:request",
] as const;

/**
 * Permisos exclusivos de cuentas de empleado: "Mi Panel" es la vista personal
 * del empleado vinculado a la cuenta, así que los roles de gestión (Gerencia,
 * Administrativo y SysAdmin) no lo tienen — solo Chofer, Chofer Coordinador,
 * Recepcionista y Supervisor.
 */
const EMPLOYEE_ONLY_PERMISSIONS: ReadonlySet<string> = new Set(["my-panel:view"]);

const withoutEmployeeOnly = (codes: readonly string[]): readonly string[] =>
  codes.filter((code) => !EMPLOYEE_ONLY_PERMISSIONS.has(code));

/**
 * Permisos de solo lectura: todo lo que permite mirar (`:view`) y exportar
 * (`:export`), más el paquete de autoservicio (perfil, notificaciones, sus
 * propias tareas y solicitar vacaciones). Es la base del rol Administrativo,
 * que acompaña a Gerencia pero sin poder modificar nada del sistema.
 */
const READ_ONLY_PERMISSIONS: readonly string[] = withoutEmployeeOnly(
  Array.from(
    new Set([
      ...PERMISSION_DEFINITIONS.filter(
        (def) => def.code.endsWith(":view") || def.code.endsWith(":export"),
      ).map((def) => def.code),
      ...SELF_SERVICE_PERMISSIONS,
    ]),
  ),
);

/** Catálogo completo menos lo exclusivo de empleados (Gerencia y SysAdmin). */
const FULL_MANAGEMENT_PERMISSIONS: readonly string[] = withoutEmployeeOnly(ALL_PERMISSION_CODES);

/**
 * Supervisor: autoservicio + lectura de la página de Roles. El tablero de solo
 * lectura carga empleados y horarios a través de `roles:view` (las rutas de
 * listado lo aceptan), así que no se le conceden `employees:view` ni
 * `schedules:view`, que abrirían las páginas de Empleados y Horarios.
 */
const SUPERVISOR_PERMISSIONS: readonly string[] = Array.from(
  new Set([
    ...SELF_SERVICE_PERMISSIONS,
    "roles:view",
    "employee-hours:view",
    "weekly-summaries:view",
    "biweekly-summaries:view",
    "monthly-summaries:view",
  ]),
);

/**
 * Default permissions granted to each seeded role, expressed in stable codes.
 * Used by both the auth seeder and the catalog normalisation migration so a
 * fresh database and an existing one converge on the same baseline.
 */
export const DEFAULT_ROLE_PERMISSIONS: Readonly<Record<string, readonly string[]>> = {
  Gerencia: FULL_MANAGEMENT_PERMISSIONS,
  // Igual que Gerencia pero solo lectura: ver y exportar, sin crear/editar/eliminar.
  Administrativo: READ_ONLY_PERMISSIONS,
  Supervisor: SUPERVISOR_PERMISSIONS,
  // Un rol por puesto (ver POSITION_ROLE_NAMES). Arrancan con el autoservicio
  // y se afinan desde Configuración → Roles.
  "Chofer Coordinador": SELF_SERVICE_PERMISSIONS,
  Recepcionista: SELF_SERVICE_PERMISSIONS,
  Chofer: SELF_SERVICE_PERMISSIONS,
  // Rol especial (SysAdmin): acceso total, igual que Gerencia.
  SysAdmin: FULL_MANAGEMENT_PERMISSIONS,
};

/** Seeded role names, in priority order. */
export const ROLE_NAMES = [
  "Gerencia",
  "Administrativo",
  "Supervisor",
  "Chofer Coordinador",
  "Recepcionista",
  "Chofer",
  "SysAdmin",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

/**
 * Rol especial de la plataforma (acceso total). No se ofrece en los selectores
 * de rol de la UI (crear/editar usuario): se asigna deliberadamente a quien
 * administra, no desde el formulario.
 */
export const HIDDEN_ROLE_NAMES: readonly RoleName[] = ["SysAdmin"];

const HIDDEN_ROLE_NAMES_SET: ReadonlySet<string> = new Set(
  HIDDEN_ROLE_NAMES.map((name) => name.toLowerCase()),
);

/** true si el rol puede elegirse desde los selectores de la UI. */
export const isRoleSelectable = (name?: string | null): boolean =>
  typeof name === "string" && !HIDDEN_ROLE_NAMES_SET.has(name.trim().toLowerCase());

/**
 * Roles de gestión: los únicos que administran la plataforma (roles,
 * permisos y usuarios). Un permiso por sí solo no habilita esas pantallas,
 * así que la UI y la API exigen rol de gestión además del permiso.
 */
export const MANAGEMENT_ROLE_NAMES: readonly RoleName[] = [
  "Gerencia",
  "Administrativo",
  "SysAdmin",
];

const MANAGEMENT_ROLE_NAMES_SET: ReadonlySet<string> = new Set(
  MANAGEMENT_ROLE_NAMES.map((name) => name.toLowerCase()),
);

/** true si el nombre corresponde a un rol de gestión (Gerencia/Administrativo/SysAdmin). */
export const isManagementRoleName = (name?: string | null): boolean =>
  typeof name === "string" && MANAGEMENT_ROLE_NAMES_SET.has(name.trim().toLowerCase());

/**
 * Roles que pueden ver la sección "Administración" de Configuración (Usuarios
 * y Roles): Gerencia, Administrativo y SysAdmin. Además hace falta el permiso de
 * cada pestaña. Un Supervisor con `roles:view` puede ver el tablero de Roles,
 * pero no esta sección.
 */
export const ADMIN_SETTINGS_ROLE_NAMES: readonly RoleName[] = [
  "Gerencia",
  "Administrativo",
  "SysAdmin",
];

const ADMIN_SETTINGS_ROLE_NAMES_SET: ReadonlySet<string> = new Set(
  ADMIN_SETTINGS_ROLE_NAMES.map((name) => name.toLowerCase()),
);

/** true si el nombre corresponde a un rol con acceso a la sección Administración. */
export const isAdminSettingsRoleName = (name?: string | null): boolean =>
  typeof name === "string" && ADMIN_SETTINGS_ROLE_NAMES_SET.has(name.trim().toLowerCase());

/** Estructura mínima que debe cumplir un usuario para revisar sus roles. */
type RoleNameHolder = {
  roles?: ReadonlyArray<{ name?: string | null } | null> | null;
};

/** true si el usuario tiene al menos un rol de gestión. */
export const hasManagementRole = (user?: RoleNameHolder | null): boolean => {
  const roles = user?.roles;
  return Array.isArray(roles) && roles.some((role) => isManagementRoleName(role?.name));
};

/** true si el usuario puede ver la sección "Administración" de Configuración. */
export const hasAdminSettingsRole = (user?: RoleNameHolder | null): boolean => {
  const roles = user?.roles;
  return Array.isArray(roles) && roles.some((role) => isAdminSettingsRoleName(role?.name));
};

export default PERMISSIONS;
