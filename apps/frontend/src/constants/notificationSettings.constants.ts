// Notification settings — define the notification types a user can enable/disable.
// Persisted per-user inside `user.settings.notifications` (JSONB merged by the backend).
import {
  Wallet,
  Users,
  CalendarDays,
  Car,
  Package,
  UserCog,
  Shield,
  Clock,
  DatabaseBackup,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NotificationSettingKey =
  | "payments"
  | "employees"
  | "schedules"
  | "vehicles"
  | "courier"
  | "users"
  | "roles"
  | "hoursGeneration"
  | "backups"
  | "system";

export interface NotificationSettingItem {
  key: NotificationSettingKey;
  label: string;
  description: string;
  icon: LucideIcon;
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
        icon: Wallet,
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
        icon: Users,
        default: true,
      },
      {
        key: "schedules",
        label: "Horarios",
        description: "Creación, edición y eliminación de horarios.",
        icon: CalendarDays,
        default: true,
      },
      {
        key: "vehicles",
        label: "Vehículos",
        description: "Registro, edición y eliminación de vehículos.",
        icon: Car,
        default: true,
      },
      {
        key: "courier",
        label: "Servicio de mensajería",
        description: "Creación, edición y eliminación de servicios de courier.",
        icon: Package,
        default: true,
      },
      {
        key: "users",
        label: "Usuarios",
        description: "Registro, edición y eliminación de usuarios.",
        icon: UserCog,
        default: true,
      },
      {
        key: "roles",
        label: "Roles",
        description: "Creación, edición y eliminación de roles.",
        icon: Shield,
        default: true,
      },
    ],
  },
  {
    id: "system",
    title: "Sistema",
    items: [
      {
        key: "hoursGeneration",
        label: "Generación de horas",
        description: "Éxito o error al generar horas automáticamente.",
        icon: Clock,
        default: true,
      },
      {
        key: "backups",
        label: "Copias de seguridad",
        description: "Backup creado correctamente o con errores.",
        icon: DatabaseBackup,
        default: true,
      },
      {
        key: "system",
        label: "Avisos del sistema",
        description: "Mensajes generales y avisos de limpieza de datos.",
        icon: Info,
        default: true,
      },
    ],
  },
];

export const NOTIFICATION_SETTING_DEFAULTS: Record<NotificationSettingKey, boolean> = {
  payments: true,
  employees: true,
  schedules: true,
  vehicles: true,
  courier: true,
  users: true,
  roles: true,
  hoursGeneration: true,
  backups: true,
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
  courier: "courier",
  user: "users",
  role: "roles",
  hours: "hoursGeneration",
  backup: "backups",
  "data-deletion": "system",
  system: "system",
  report: "system",
};

export const notificationSourceToSettingKey = (
  source?: string,
): NotificationSettingKey | undefined => {
  if (!source) return undefined;
  if (source.startsWith("payment-")) return "payments";
  return SOURCE_TO_SETTING[source];
};
