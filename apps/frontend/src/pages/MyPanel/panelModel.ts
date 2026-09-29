import type { Employee } from "../../models/Employee";
import type { MyPanelOverview, MyPanelWeekDay } from "../../models/MyPanel";
import type { Payment } from "../../models/Payment";
import type { Task } from "../../models/Task";
import { ROUTES } from "../../constants/constants";

// Lógica pura de "Mi Panel": fechas en calendario local, formatos en español y
// los datos derivados que consumen las pestañas. Vive fuera de los componentes
// para poder probarla sin renderizar nada.

/** Overview de un usuario vinculado a un empleado (siempre trae `employee`). */
export type LinkedOverview = MyPanelOverview & { employee: Employee };

export const isLinkedOverview = (overview: MyPanelOverview | null): overview is LinkedOverview =>
  Boolean(overview?.linked && overview.employee);

export type PanelTabKey = "resumen" | "horas" | "vacaciones" | "pagos" | "expediente";

export const PANEL_TAB_KEYS: readonly PanelTabKey[] = [
  "resumen",
  "horas",
  "vacaciones",
  "pagos",
  "expediente",
];

export const isPanelTabKey = (value: string | null): value is PanelTabKey =>
  value !== null && (PANEL_TAB_KEYS as readonly string[]).includes(value);

// Horas ordinarias de referencia por período: las mismas que usa Reportes para
// detectar horas extra (semanal 48, quincenal 96, mensual 192).
export const REGULAR_HOURS = { week: 48, biweek: 96, month: 192 } as const;

const pad = (value: number): string => String(value).padStart(2, "0");

/** Fecha local como YYYY-MM-DD, sin desfase de zona horaria. */
export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** YYYY-MM-DD (o ISO con hora) → Date local a medianoche. */
export const parseISODate = (value: string): Date => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Días de calendario entre dos fechas YYYY-MM-DD (positivo si `to` es posterior). */
export const diffDays = (from: string, to: string): number =>
  Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000);

const WEEKDAYS_FULL = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const WEEKDAYS_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS_FULL = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "lunes 28 de septiembre" */
export const formatLongDate = (date: Date): string =>
  `${WEEKDAYS_FULL[date.getDay()]} ${date.getDate()} de ${MONTHS_FULL[date.getMonth()]}`;

/** "28 sep" (o "28 sep 2027" si no es del año de referencia). */
export const formatShortDate = (value: string, referenceYear = new Date().getFullYear()): string => {
  const date = parseISODate(value);
  const base = `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
  return date.getFullYear() === referenceYear ? base : `${base} ${date.getFullYear()}`;
};

/** "lun 28 sep" */
export const formatWeekdayDate = (value: string): string => {
  const date = parseISODate(value);
  return `${WEEKDAYS_SHORT[date.getDay()]} ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
};

/** "5 – 9 oct 2026", "28 sep – 2 oct 2026" o "30 dic 2026 – 3 ene 2027". */
export const formatDateRange = (start: string, end: string): string => {
  const from = parseISODate(start);
  const to = parseISODate(end);
  if (from.getFullYear() !== to.getFullYear()) {
    return `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} ${from.getFullYear()} – ${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${to.getFullYear()}`;
  }
  if (from.getMonth() === to.getMonth()) {
    return from.getDate() === to.getDate()
      ? `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} ${from.getFullYear()}`
      : `${from.getDate()} – ${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${from.getFullYear()}`;
  }
  return `${from.getDate()} ${MONTHS_SHORT[from.getMonth()]} – ${to.getDate()} ${MONTHS_SHORT[to.getMonth()]} ${to.getFullYear()}`;
};

export const monthName = (month: number): string => MONTHS_FULL[month - 1] ?? "";

/** Quincena 1..24 → "1–15 sep" / "16–30 sep" (el año solo afecta a febrero). */
export const biweekShortLabel = (biweekNumber: number, year = new Date().getFullYear()): string => {
  const month = Math.floor((biweekNumber - 1) / 2);
  const firstHalf = biweekNumber % 2 === 1;
  const startDay = firstHalf ? 1 : 16;
  const endDay = firstHalf ? 15 : new Date(year, month + 1, 0).getDate();
  return `${startDay}–${endDay} ${MONTHS_SHORT[month] ?? ""}`.trim();
};

/** "1–15 sep 2026" */
export const biweekLabel = (biweekNumber: number, year: number): string =>
  `${biweekShortLabel(biweekNumber, year)} ${year}`;

export const weekdayName = (isoDate: string): string => WEEKDAYS_FULL[parseISODate(isoDate).getDay()];

export const greeting = (hour: number): string =>
  hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

/** Horas sin ceros sobrantes: 8 → "8", 7.5 → "7.5". */
export const formatHours = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

const pluralize = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

export const formatDaysCount = (count: number): string => pluralize(count, "día", "días");

// ─── Turnos de la semana ────────────────────────────────────────────────────

/** Un día "tiene turno" cuando se le asignó un Horario/Lugar. */
export const isAssigned = (day: MyPanelWeekDay | undefined): day is MyPanelWeekDay =>
  Boolean(day && day.scheduleLabel);

export interface ShiftFacts {
  /** Hoy, tenga o no lugar asignado. */
  today?: MyPanelWeekDay;
  /** Próximo día (posterior a hoy) con lugar asignado: esta semana o la siguiente. */
  next?: MyPanelWeekDay;
  /** Horas asignadas en la semana (suma de los días). */
  registeredWeek: number;
  /** Horas por encima de la jornada ordinaria de la semana. */
  overtimeWeek: number;
  /** Días de la semana con lugar asignado. */
  shiftDays: number;
}

export const getShiftFacts = (overview: MyPanelOverview, todayIso: string): ShiftFacts => {
  const days = overview.week?.days ?? [];
  const nextWeekDays = overview.nextWeek?.days ?? [];
  const registeredWeek = days.reduce((sum, day) => sum + day.hours, 0);

  return {
    today: days.find((day) => day.date === todayIso),
    next: [...days, ...nextWeekDays].find((day) => day.date > todayIso && isAssigned(day)),
    registeredWeek,
    overtimeWeek: Math.max(0, registeredWeek - REGULAR_HOURS.week),
    shiftDays: days.filter(isAssigned).length,
  };
};

/** "Hoy", "Mañana", "Ayer" o vacío para el resto de los días. */
export const relativeDayLabel = (date: string, todayIso: string): string => {
  const diff = diffDays(todayIso, date);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  return "";
};

// ─── Tareas ─────────────────────────────────────────────────────────────────

export const pendingTasks = (tasks: Task[]): Task[] => tasks.filter((task) => !task.completedAt);

/** Vencimiento primero (las sin fecha al final); a igual fecha, mayor prioridad. */
export const sortTasks = (tasks: Task[]): Task[] =>
  [...tasks].sort((a, b) => {
    if (a.dueDate === b.dueDate) return b.priority - a.priority;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });

export type DueTone = "danger" | "warning" | "info" | "default";

export interface DueInfo {
  label: string;
  tone: DueTone;
}

export const describeDue = (dueDate: string | null, todayIso: string): DueInfo => {
  if (!dueDate) return { label: "Sin fecha", tone: "default" };
  const diff = diffDays(todayIso, dueDate);
  if (diff < 0) {
    return { label: `Venció hace ${formatDaysCount(-diff)}`, tone: "danger" };
  }
  if (diff === 0) return { label: "Hoy", tone: "warning" };
  if (diff === 1) return { label: "Mañana", tone: "info" };
  return { label: formatWeekdayDate(dueDate), tone: "default" };
};

// ─── Avisos que requieren atención ──────────────────────────────────────────

export type AttentionTone = "danger" | "warning" | "info";

export type AttentionTarget = { tab: PanelTabKey } | { to: string };

export interface AttentionItem {
  id: string;
  tone: AttentionTone;
  label: string;
  target: AttentionTarget;
}

const TONE_ORDER: Record<AttentionTone, number> = { danger: 0, warning: 1, info: 2 };

const describeExpiry = (days: number | null | undefined): string => {
  if (days == null) return "está por vencer";
  if (days <= 0) return "vence hoy";
  if (days === 1) return "vence mañana";
  return `vence en ${days} días`;
};

export const getAttentionItems = (overview: MyPanelOverview, todayIso: string): AttentionItem[] => {
  const items: AttentionItem[] = [];

  for (const license of overview.licenses) {
    if (license.status === "vencida") {
      items.push({
        id: `license-${license.id}`,
        tone: "danger",
        label: `Licencia ${license.licenseType} vencida`,
        target: { tab: "expediente" },
      });
    } else if (license.status === "por_vencer") {
      items.push({
        id: `license-${license.id}`,
        tone: "warning",
        label: `Licencia ${license.licenseType} ${describeExpiry(license.daysUntilExpiry)}`,
        target: { tab: "expediente" },
      });
    }
  }

  const pending = pendingTasks(overview.tasks);
  const overdue = pending.filter((task) => task.dueDate && task.dueDate < todayIso).length;
  const dueToday = pending.filter((task) => task.dueDate === todayIso).length;
  if (overdue > 0) {
    items.push({
      id: "tasks-overdue",
      tone: "danger",
      label: pluralize(overdue, "tarea vencida", "tareas vencidas"),
      target: { to: ROUTES.TASKS },
    });
  }
  if (dueToday > 0) {
    items.push({
      id: "tasks-today",
      tone: "info",
      label: dueToday === 1 ? "1 tarea vence hoy" : `${dueToday} tareas vencen hoy`,
      target: { to: ROUTES.TASKS },
    });
  }

  const pendingVacations = overview.vacations.filter((vacation) => vacation.status === "pending");
  if (pendingVacations.length > 0) {
    items.push({
      id: "vacations-pending",
      tone: "info",
      label:
        pendingVacations.length === 1
          ? "Solicitud de vacaciones en revisión"
          : `${pendingVacations.length} solicitudes de vacaciones en revisión`,
      target: { tab: "vacaciones" },
    });
  }

  return items.sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone]);
};

/** Punto de atención de cada pestaña (para el indicador de la barra de pestañas). */
export const getTabAlerts = (
  overview: MyPanelOverview | null,
): Partial<Record<PanelTabKey, { tone: AttentionTone; hint: string }>> => {
  if (!overview?.linked) return {};
  const alerts: Partial<Record<PanelTabKey, { tone: AttentionTone; hint: string }>> = {};

  if (overview.vacations.some((vacation) => vacation.status === "pending")) {
    alerts.vacaciones = { tone: "info", hint: "solicitud en revisión" };
  }

  if (overview.licenses.some((license) => license.status === "vencida")) {
    alerts.expediente = { tone: "danger", hint: "licencia vencida" };
  } else if (overview.licenses.some((license) => license.status === "por_vencer")) {
    alerts.expediente = { tone: "warning", hint: "licencia por vencer" };
  }

  return alerts;
};

/** Importe sin ",00" final: ¢412.350,00 → ¢412.350. */
export const trimZeroCents = (formatted: string): string =>
  formatted.endsWith(",00") ? formatted.slice(0, -3) : formatted;

/** "3 años 6 meses 14 días" → "3 años y 6 meses" (las dos unidades mayores). */
export const shortTenure = (tenure: string | null): string | null => {
  if (!tenure) return null;
  const parts = tenure.match(/\d+ [^\d\s]+/g) ?? [];
  return parts.length > 0 ? parts.slice(0, 2).join(" y ") : tenure;
};

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

// ─── Pagos ──────────────────────────────────────────────────────────────────

/** De la boleta más reciente a la más antigua. */
export const sortPaymentsDesc = (payments: Payment[]): Payment[] =>
  [...payments].sort((a, b) => b.year - a.year || b.biweekNumber - a.biweekNumber);

/** Última boleta no cancelada. */
export const latestPayment = (payments: Payment[]): Payment | undefined =>
  sortPaymentsDesc(payments.filter((payment) => payment.status !== "cancelled"))[0];
