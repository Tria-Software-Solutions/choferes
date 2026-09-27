// Notification settings — define the notification types a user can enable/disable.
// Persisted per-user inside `user.settings.notifications` (JSONB merged by the backend).
import { IconCalendarTime, IconCalendarUser, IconInfoCircle, IconListCheck, IconParking, IconUserCog, IconUsers, IconWallet } from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";

export type NotificationSettingKey =
  | "payments"
  | "tasks"
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
    title: "Pagos",
    items: [
      {
        key: "payments",
        label: "Recordatorios de pago",
        description: "Aviso el 15 y el último día de cada mes para realizar los pagos de quincena.",
        icon: IconWallet,
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
    id: "activity",
    title: "Actividad",
    items: [
      {
        key: "employees",
        label: "Empleados",
        description: "Registro, edición y eliminación de empleados.",
        icon: IconUsers,
        default: true,
      },
      {
        key: "schedules",
        label: "Horarios",
        description: "Creación, edición y eliminación de horarios.",
        icon: IconCalendarTime,
        default: true,
      },
      {
        key: "vehicles",
        label: "Vehículos",
        description: "Registro, edición y eliminación de vehículos.",
        icon: IconParking,
        default: true,
      },
      {
        key: "users",
        label: "Usuarios",
        description: "Registro, edición y eliminación de usuarios.",
        icon: IconUserCog,
        default: true,
      },
      {
        key: "roles",
        label: "Roles",
        description: "Creación, edición y eliminación de roles.",
        icon: IconCalendarUser,
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
  tasks: true,
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
// Backend payment reminders use "payment-1:YYYY-M" / "payment-2:YYYY-M".
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
  if (source.startsWith("task-reminder:")) return "tasks";
  return SOURCE_TO_SETTING[source];
};
