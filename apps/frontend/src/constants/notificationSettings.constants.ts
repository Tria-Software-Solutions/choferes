// Notification settings — define the notification types a user can enable/disable.
// Persisted per-user inside `user.settings.notifications` (JSONB merged by the backend).
import { IconBeach, IconCalendarTime, IconId, IconInfoCircle, IconListCheck, IconReceipt, IconShieldCheck, IconShieldExclamation, IconUserCog, IconUsers, IconWallet } from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

export type NotificationSettingKey =
  | "payments"
  | "boletas"
  | "tasks"
  | "vacations"
  | "licenses"
  | "disciplines"
  | "employees"
  | "schedules"
  | "vehicles"
  | "users"
  | "roles"
  | "system";

export interface NotificationSettingItem {
  key: NotificationSettingKey;
  label: string;
  description: string;
  icon: TablerIcon;
  default: boolean;
}

export interface NotificationSettingGroup {
  id: string;
  title: string;
  description?: string;
  items: NotificationSettingItem[];
}

export const NOTIFICATION_SETTING_GROUPS: NotificationSettingGroup[] = [
  {
    id: "payments",
    title: "Pagos y boletas",
    items: [
      {
        key: "payments",
        label: "Recordatorios de quincena",
        description: "Aviso el 15 y el último día de cada mes para realizar los pagos de quincena.",
        icon: IconWallet,
        default: true,
      },
      {
        key: "boletas",
        label: "Boletas de pago",
        description: "Boletas creadas, enviadas, modificadas o eliminadas y generadas automáticamente.",
        icon: IconReceipt,
        default: true,
      },
    ],
  },
  {
    id: "tasks",
    title: "Tareas",
    items: [
      {
        key: "tasks",
        label: "Recordatorios de tareas",
        description: "Aviso a la hora programada en cada recordatorio de tu lista de tareas.",
        icon: IconListCheck,
        default: true,
      },
    ],
  },
  {
    id: "employees",
    title: "Empleados",
    items: [
      {
        key: "vacations",
        label: "Vacaciones",
        description: "Solicitudes, aprobaciones, rechazos y cancelaciones de vacaciones.",
        icon: IconBeach,
        default: true,
      },
      {
        key: "licenses",
        label: "Licencias de conducir",
        description: "Registro, cambios y avisos de vencimiento de licencias.",
        icon: IconId,
        default: true,
      },
      {
        key: "disciplines",
        label: "Amonestaciones",
        description: "Nueva amonestación y cambios o eliminación de una existente.",
        icon: IconShieldExclamation,
        default: true,
      },
      {
        key: "employees",
        label: "Altas y bajas",
        description: "Registro de empleados, fin de contrato y terminaciones programadas.",
        icon: IconUsers,
        default: true,
      },
    ],
  },
  {
    id: "schedules",
    title: "Horarios y turnos",
    items: [
      {
        key: "schedules",
        label: "Horarios y turnos",
        description: "Creación, edición, eliminación y asignación de turnos a empleados.",
        icon: IconCalendarTime,
        default: true,
      },
    ],
  },
  {
    id: "users",
    title: "Cuentas y accesos",
    items: [
      {
        key: "users",
        label: "Cuentas de usuario",
        description: "Alta de cuentas, bienvenida, activación o baja y cambios de contraseña o claves temporales.",
        icon: IconUserCog,
        default: true,
      },
    ],
  },
  {
    id: "roles",
    title: "Roles y permisos",
    items: [
      {
        key: "roles",
        label: "Roles y permisos",
        description: "Asignación, revocación y cambios de rol o de permisos publicados.",
        icon: IconShieldCheck,
        default: true,
      },
    ],
  },
  {
    id: "system",
    title: "Sistema",
    items: [
      {
        key: "system",
        label: "Avisos del sistema",
        description: "Mensajes generales y avisos de limpieza de datos.",
        icon: IconInfoCircle,
        default: true,
      },
    ],
  },
];

export const NOTIFICATION_SETTING_DEFAULTS: Record<NotificationSettingKey, boolean> = {
  payments: true,
  boletas: true,
  tasks: true,
  vacations: true,
  licenses: true,
  disciplines: true,
  employees: true,
  schedules: true,
  vehicles: true,
  users: true,
  roles: true,
  system: true,
};

// Merge stored settings (user.settings.notifications) with defaults so missing keys default to ON.
export const getNotificationSettings = (
  settings?: Record<string, unknown>,
): Record<NotificationSettingKey, boolean> => {
  const stored = ((settings as { notifications?: Record<string, boolean> } | undefined)
    ?.notifications ?? {}) as Partial<Record<NotificationSettingKey, boolean>>;
  return { ...NOTIFICATION_SETTING_DEFAULTS, ...stored };
};

// Map a notification's `source` to the setting key that controls it, so the
// NotificationContext can skip disabled notifications (both new and fetched).
const SOURCE_TO_SETTING: Record<string, NotificationSettingKey> = {
  employee: "employees",
  schedule: "schedules",
  vehicle: "vehicles",
  user: "users",
  role: "roles",
  "data-deletion": "system",
  system: "system",
  report: "system",
};

export const notificationSourceToSettingKey = (
  source?: string,
): NotificationSettingKey | undefined => {
  if (!source) return undefined;
  if (source.startsWith("payment-")) return "payments";
  if (source.startsWith("boleta-") || source.startsWith("boletas-")) return "boletas";
  if (source.startsWith("task-reminder:")) return "tasks";
  if (source.startsWith("vacation-")) return "vacations";
  if (source.startsWith("license-")) return "licenses";
  if (source.startsWith("disciplinary-")) return "disciplines";
  if (source.startsWith("employee-") || source.startsWith("terminations-")) return "employees";
  if (source.startsWith("schedule-")) return "schedules";
  if (
    source.startsWith("account-") ||
    source.startsWith("user-") ||
    source.startsWith("password-") ||
    source.startsWith("temp-password")
  )
    return "users";
  if (source.startsWith("role-")) return "roles";
  return SOURCE_TO_SETTING[source];
};