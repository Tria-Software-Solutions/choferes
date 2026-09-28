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
 *    server authorizes against. Format: `<module>:<action>[:<subaction>]`.
 *  - `label` is the Spanish display name. It is what users see and what the DB
 *    stores in the legacy `permissions.name` column for backwards compatibility.
 *  - `module` groups permissions in the UI (roles editor, permissions list).
 *
 * The `PERMISSIONS` map (key -> label) is kept as the public API used across the
 * frontend, so UI code reads `PERMISSIONS.VIEW_ROLES` instead of raw strings.
 */
export type PermissionModule =
  | "Roles"
  | "Empleados"
  | "Horarios"
  | "Vehículos"
  | "Usuarios"
  | "Admin"
  | "Resúmenes"
  | "Pagos"
  | "Vacaciones"
  | "Licencias"
  | "Amonestaciones"
  | "Tareas";

export interface PermissionDefinition {
  readonly code: string;
  readonly module: PermissionModule;
  readonly label: string;
}

export const PERMISSION_CATALOG = {
  // ── Roles ──────────────────────────────────────────────────────────────────
  VIEW_ROLES: { code: "roles:view", module: "Roles", label: "Ver Roles" },
  VIEW_EMPLOYEE_ROLES_HOURS: {
    code: "roles:hours:view",
    module: "Roles",
    label: "Ver Horas de Empleados",
  },
  EDIT_EMPLOYEE_ROLES: {
    code: "roles:hours:edit",
    module: "Roles",
    label: "Editar Roles de Empleados",
  },
  EXPORT_EXCEL_ROLES: {
    code: "roles:export:excel",
    module: "Roles",
    label: "Exportar Excel de Roles de Empleados",
  },
  EXPORT_PDF_ROLES: {
    code: "roles:export:pdf",
    module: "Roles",
    label: "Exportar PDF de Roles de Empleados",
  },
  CREATE_ROLE: { code: "roles:create", module: "Roles", label: "Crear Rol" },
  EDIT_ROLE: { code: "roles:edit", module: "Roles", label: "Editar Rol" },
  DELETE_ROLE: { code: "roles:delete", module: "Roles", label: "Eliminar Rol" },

  // ── Empleados ────────────────────────────────────────────────────────────────
  VIEW_EMPLOYEES: { code: "employees:view", module: "Empleados", label: "Ver Empleados" },
  CREATE_EMPLOYEES: { code: "employees:create", module: "Empleados", label: "Crear Empleado" },
  EDIT_EMPLOYEES: { code: "employees:edit", module: "Empleados", label: "Editar Empleado" },
  DELETE_EMPLOYEES: { code: "employees:delete", module: "Empleados", label: "Eliminar Empleado" },
  EXPORT_EXCEL_EMPLOYEES: {
    code: "employees:export:excel",
    module: "Empleados",
    label: "Exportar Excel de Empleados",
  },
  EXPORT_PDF_EMPLOYEES: {
    code: "employees:export:pdf",
    module: "Empleados",
    label: "Exportar PDF de Empleados",
  },

  // ── Horarios ─────────────────────────────────────────────────────────────────
  VIEW_SCHEDULES: { code: "schedules:view", module: "Horarios", label: "Ver Horarios" },
  CREATE_SCHEDULES: { code: "schedules:create", module: "Horarios", label: "Crear Horario" },
  EDIT_SCHEDULES: { code: "schedules:edit", module: "Horarios", label: "Editar Horario" },
  DELETE_SCHEDULES: { code: "schedules:delete", module: "Horarios", label: "Eliminar Horario" },
  REORDER_SCHEDULES: {
    code: "schedules:reorder",
    module: "Horarios",
    label: "Reordenar Horarios",
  },
  EXPORT_EXCEL_SCHEDULES: {
    code: "schedules:export:excel",
    module: "Horarios",
    label: "Exportar Excel de Horarios",
  },
  EXPORT_PDF_SCHEDULES: {
    code: "schedules:export:pdf",
    module: "Horarios",
    label: "Exportar PDF de Horarios",
  },

  // ── Vehículos ────────────────────────────────────────────────────────────────
  VIEW_VEHICLES: { code: "vehicles:view", module: "Vehículos", label: "Ver Vehículos" },
  CREATE_VEHICLES: { code: "vehicles:create", module: "Vehículos", label: "Crear Vehículo" },
  EDIT_VEHICLES: { code: "vehicles:edit", module: "Vehículos", label: "Editar Vehículo" },
  DELETE_VEHICLES: { code: "vehicles:delete", module: "Vehículos", label: "Eliminar Vehículo" },
  EXPORT_EXCEL_VEHICLES: {
    code: "vehicles:export:excel",
    module: "Vehículos",
    label: "Exportar Excel de Vehículos",
  },
  EXPORT_PDF_VEHICLES: {
    code: "vehicles:export:pdf",
    module: "Vehículos",
    label: "Exportar PDF de Vehículos",
  },

  // ── Usuarios / Admin ─────────────────────────────────────────────────────────
  VIEW_USERS: { code: "users:view", module: "Usuarios", label: "Ver Usuarios" },
  CREATE_USERS: { code: "users:create", module: "Usuarios", label: "Crear Usuario" },
  EDIT_USER: { code: "users:edit", module: "Usuarios", label: "Editar Usuario" },
  ENABLE_DISABLE_USER: {
    code: "users:toggle-active",
    module: "Usuarios",
    label: "Habilitar/Deshabilitar Usuario",
  },
  VIEW_ADMIN: { code: "admin:view", module: "Admin", label: "Ver Admin" },

  // ── Resúmenes ────────────────────────────────────────────────────────────────
  VIEW_WEEKLY_SUMMARY: {
    code: "summaries:weekly:view",
    module: "Resúmenes",
    label: "Ver Resumen Semanal",
  },
  EDIT_WEEKLY_SUMMARY: {
    code: "summaries:weekly:edit",
    module: "Resúmenes",
    label: "Editar Resumen Semanal",
  },
  VIEW_BIWEEKLY_SUMMARY: {
    code: "summaries:biweekly:view",
    module: "Resúmenes",
    label: "Ver Resumen Quincenal",
  },
  EDIT_BIWEEKLY_SUMMARY: {
    code: "summaries:biweekly:edit",
    module: "Resúmenes",
    label: "Editar Resumen Quincenal",
  },
  VIEW_MONTHLY_SUMMARY: {
    code: "summaries:monthly:view",
    module: "Resúmenes",
    label: "Ver Resumen Mensual",
  },
  EDIT_MONTHLY_SUMMARY: {
    code: "summaries:monthly:edit",
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

  // ── Tareas ────────────────────────────────────────────────────────────────────
  VIEW_TASKS: { code: "tasks:view", module: "Tareas", label: "Ver Tareas" },
  CREATE_TASK: { code: "tasks:create", module: "Tareas", label: "Crear Tarea" },
  EDIT_TASK: { code: "tasks:edit", module: "Tareas", label: "Editar Tarea" },
  DELETE_TASK: { code: "tasks:delete", module: "Tareas", label: "Eliminar Tarea" },

  // ── Vacaciones ───────────────────────────────────────────────────────────────
  VIEW_VACATIONS: { code: "vacations:view", module: "Vacaciones", label: "Ver Vacaciones" },
  CREATE_VACATION: { code: "vacations:create", module: "Vacaciones", label: "Crear Vacación" },
  EDIT_VACATION: { code: "vacations:edit", module: "Vacaciones", label: "Editar Vacación" },
  DELETE_VACATION: { code: "vacations:delete", module: "Vacaciones", label: "Eliminar Vacación" },

  // ── Licencias de conducir ─────────────────────────────────────────────────
  VIEW_LICENSES: { code: "licenses:view", module: "Licencias", label: "Ver Licencias" },
  CREATE_LICENSE: { code: "licenses:create", module: "Licencias", label: "Crear Licencia" },
  EDIT_LICENSE: { code: "licenses:edit", module: "Licencias", label: "Editar Licencia" },
  DELETE_LICENSE: { code: "licenses:delete", module: "Licencias", label: "Eliminar Licencia" },

  // ── Amonestaciones / llamadas de atención ─────────────────────────────────
  VIEW_DISCIPLINARY: {
    code: "disciplinary:view",
    module: "Amonestaciones",
    label: "Ver Amonestaciones",
  },
  CREATE_DISCIPLINARY: {
    code: "disciplinary:create",
    module: "Amonestaciones",
    label: "Crear Amonestación",
  },
  EDIT_DISCIPLINARY: {
    code: "disciplinary:edit",
    module: "Amonestaciones",
    label: "Editar Amonestación",
  },
  DELETE_DISCIPLINARY: {
    code: "disciplinary:delete",
    module: "Amonestaciones",
    label: "Eliminar Amonestación",
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
  "Empleados",
  "Roles",
  "Horarios",
  "Vehículos",
  "Usuarios",
  "Admin",
  "Resúmenes",
  "Pagos",
  "Vacaciones",
  "Licencias",
  "Amonestaciones",
  "Tareas"
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
 * Default permissions granted to each seeded role, expressed in stable codes.
 * Used by both the auth seeder and the catalog normalisation migration so a
 * fresh database and an existing one converge on the same baseline.
 */
export const DEFAULT_ROLE_PERMISSIONS: Readonly<Record<string, readonly string[]>> = {
  Gerencia: ALL_PERMISSION_CODES,
  Administrativo: [
    "roles:view",
    "roles:hours:view",
    "roles:hours:edit",
    "roles:export:excel",
    "roles:export:pdf",
    "employees:view",
    "employees:export:excel",
    "employees:export:pdf",
    "schedules:view",
    "schedules:export:excel",
    "schedules:export:pdf",
    "vehicles:view",
    "vehicles:export:excel",
    "vehicles:export:pdf",
    "payments:view",
    "payments:create",
    "payments:edit",
    "payments:send-email",
    "vacations:view",
    "vacations:create",
    "vacations:edit",
    "licenses:view",
    "licenses:create",
    "licenses:edit",
    "disciplinary:view",
    "disciplinary:create",
    "disciplinary:edit",
    "tasks:view",
    "tasks:create",
    "tasks:edit",
    "tasks:delete",
  ],
  Supervisor: [
    "roles:view",
    "roles:hours:view",
    "roles:hours:edit",
    "roles:export:excel",
    "roles:export:pdf",
    "employees:view",
    "employees:export:excel",
    "employees:export:pdf",
    "schedules:view",
    "schedules:export:excel",
    "schedules:export:pdf",
    "licenses:view",
    "disciplinary:view",
    "tasks:view",
    "tasks:create",
    "tasks:edit",
    "tasks:delete",
  ],
  Usuario: ["roles:view", "tasks:view", "tasks:create", "tasks:edit", "tasks:delete"],
};

/** Seeded role names, in priority order. */
export const ROLE_NAMES = ["Gerencia", "Administrativo", "Supervisor", "Usuario"] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export default PERMISSIONS;
