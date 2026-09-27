import { addDays, format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Theme } from "@mui/material/styles";
import { Task, TaskList, TaskListColor, TaskPriority, TaskRecurrence } from "../../models/Task";

// ─── Views ───────────────────────────────────────────────────────────────────

export type SmartView = "today" | "upcoming" | "important" | "all" | "completed";
export type TaskView = SmartView | "inbox" | `list:${number}`;

export const SMART_VIEW_LABELS: Record<SmartView, string> = {
  today: "Hoy",
  upcoming: "Próximos",
  important: "Importantes",
  all: "Todas",
  completed: "Completadas",
};

export const INBOX_LABEL = "Tareas";

export const listIdOfView = (view: TaskView): number | null | undefined => {
  if (view === "inbox") return null;
  if (view.startsWith("list:")) return Number(view.slice(5));
  return undefined;
};

export const isListView = (view: TaskView) => listIdOfView(view) !== undefined;

// ─── Dates ───────────────────────────────────────────────────────────────────

export const toISODate = (date: Date) => format(date, "yyyy-MM-dd");
export const todayISO = () => toISODate(new Date());

const parseDay = (value: string) => parseISO(`${value}T12:00:00`);

/** "Hoy", "Mañana", "Ayer", "lun 29 sept", "29 sept 2027" */
export const formatDueDate = (value: string): string => {
  const today = todayISO();
  if (value === today) return "Hoy";
  if (value === toISODate(addDays(new Date(), 1))) return "Mañana";
  if (value === toISODate(addDays(new Date(), -1))) return "Ayer";
  const date = parseDay(value);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return format(date, sameYear ? "EEE d MMM" : "d MMM yyyy", { locale: es }).replace(".", "");
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const formatLongDate = (value: string) =>
  capitalize(format(parseDay(value), "EEEE d 'de' MMMM", { locale: es }));

export const formatReminder = (iso: string): string => {
  const date = new Date(iso);
  if (!isValid(date)) return "";
  const day = toISODate(date);
  const time = format(date, "h:mm a", { locale: es });
  if (day === todayISO()) return `Hoy, ${time}`;
  if (day === toISODate(addDays(new Date(), 1))) return `Mañana, ${time}`;
  return `${formatDueDate(day)}, ${time}`;
};

export const formatTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, "h:mm a", { locale: es });
};

export const isOverdue = (task: Task) => {
  if (!task.dueDate || task.completedAt) return false;
  const today = todayISO();
  if (task.dueDate < today) return true;
  if (task.dueDate === today && task.dueTime) {
    const [h, m] = task.dueTime.split(":").map(Number);
    const due = new Date();
    due.setHours(h, m, 0, 0);
    return due.getTime() < Date.now();
  }
  return false;
};

// Quick picks shared by the add bar and the detail panel.
export const dueDateShortcuts = () => {
  const now = new Date();
  const nextMonday = addDays(now, ((8 - now.getDay()) % 7) || 7);
  return [
    { label: "Hoy", value: toISODate(now) },
    { label: "Mañana", value: toISODate(addDays(now, 1)) },
    { label: "Próxima semana", value: toISODate(nextMonday) },
  ];
};

export const reminderShortcuts = () => {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  inOneHour.setSeconds(0, 0);
  const tonight = new Date(now);
  tonight.setHours(18, 0, 0, 0);
  const tomorrowMorning = addDays(now, 1);
  tomorrowMorning.setHours(9, 0, 0, 0);
  const options = [{ label: "En 1 hora", value: inOneHour }];
  if (tonight.getTime() > now.getTime() + 15 * 60 * 1000) {
    options.push({ label: "Hoy a las 6:00 p. m.", value: tonight });
  }
  options.push({ label: "Mañana a las 9:00 a. m.", value: tomorrowMorning });
  return options;
};

/** ISO instant ↔ value of an <input type="datetime-local"> (local time). */
export const toDateTimeLocal = (iso: string | null) =>
  iso && isValid(new Date(iso)) ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "";

export const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : null);

// ─── Labels & colors ─────────────────────────────────────────────────────────

export const RECURRENCE_OPTIONS: Array<{ value: TaskRecurrence; label: string }> = [
  { value: "none", label: "No se repite" },
  { value: "daily", label: "Cada día" },
  { value: "weekdays", label: "Días laborables" },
  { value: "weekly", label: "Cada semana" },
  { value: "monthly", label: "Cada mes" },
  { value: "yearly", label: "Cada año" },
];

export const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 0, label: "Sin prioridad" },
  { value: 1, label: "Baja" },
  { value: 2, label: "Media" },
  { value: 3, label: "Alta" },
];

export const priorityColor = (priority: TaskPriority, theme: Theme): string => {
  const { colors } = theme.tokens;
  if (priority === 3) return colors.error;
  if (priority === 2) return colors.warning;
  if (priority === 1) return colors.info;
  return colors.textSubtle;
};

export const LIST_COLORS: Record<TaskListColor, string> = {
  indigo: "#6366f1",
  sky: "#0ea5e9",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  slate: "#64748b",
};

export const LIST_COLOR_OPTIONS = Object.keys(LIST_COLORS) as TaskListColor[];

// ─── Filtering, sorting & grouping ───────────────────────────────────────────

export type TaskSort = "manual" | "dueDate" | "priority" | "title" | "created";

export const SORT_OPTIONS: Array<{ value: TaskSort; label: string }> = [
  { value: "manual", label: "Orden manual" },
  { value: "dueDate", label: "Fecha de vencimiento" },
  { value: "priority", label: "Prioridad" },
  { value: "title", label: "Alfabético" },
  { value: "created", label: "Más recientes" },
];

const dueKey = (task: Task) => `${task.dueDate ?? "9999-99-99"}T${task.dueTime ?? "99:99"}`;

export const sortTasks = (tasks: Task[], sort: TaskSort): Task[] => {
  const sorted = [...tasks];
  switch (sort) {
    case "dueDate":
      return sorted.sort((a, b) => dueKey(a).localeCompare(dueKey(b)) || b.priority - a.priority);
    case "priority":
      return sorted.sort((a, b) => b.priority - a.priority || dueKey(a).localeCompare(dueKey(b)));
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "es"));
    case "created":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return sorted.sort((a, b) => a.position - b.position || b.createdAt.localeCompare(a.createdAt));
  }
};

export const matchesSearch = (task: Task, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    task.title.toLowerCase().includes(q) ||
    (task.notes ?? "").toLowerCase().includes(q) ||
    task.subtasks.some((step) => step.title.toLowerCase().includes(q))
  );
};

export interface TaskGroup {
  key: string;
  label: string;
  tone?: "danger" | "accent";
  tasks: Task[];
}

/** Open tasks of a view, grouped the way each view presents them. */
export const groupOpenTasks = (view: TaskView, open: Task[], sort: TaskSort): TaskGroup[] => {
  const today = todayISO();
  if (view === "today" || view === "upcoming") {
    const dated = sortTasks(
      open.filter((task) => task.dueDate && (view === "upcoming" || task.dueDate <= today)),
      "dueDate",
    );
    const groups = new Map<string, TaskGroup>();
    const horizon = toISODate(addDays(new Date(), 14));
    dated.forEach((task) => {
      const due = task.dueDate as string;
      let key = due;
      let label = formatDueDate(due);
      let tone: TaskGroup["tone"];
      if (due < today) {
        key = "overdue";
        label = "Vencidas";
        tone = "danger";
      } else if (due === today) {
        tone = "accent";
      } else if (due > horizon) {
        key = "later";
        label = "Más adelante";
      } else {
        label = formatLongDate(due);
      }
      if (!groups.has(key)) groups.set(key, { key, label, tone, tasks: [] });
      groups.get(key)?.tasks.push(task);
    });
    return Array.from(groups.values());
  }
  const filtered = view === "important" ? open.filter((task) => task.isImportant) : open;
  return [{ key: "open", label: "", tasks: sortTasks(filtered, isListView(view) ? sort : sort === "manual" ? "dueDate" : sort) }];
};

/** Completed tasks grouped by completion day (newest first). */
export const groupCompletedTasks = (completed: Task[]): TaskGroup[] => {
  const groups = new Map<string, TaskGroup>();
  [...completed]
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .forEach((task) => {
      const day = toISODate(new Date(task.completedAt as string));
      const label = formatDueDate(day);
      if (!groups.has(day)) groups.set(day, { key: day, label, tasks: [] });
      groups.get(day)?.tasks.push(task);
    });
  return Array.from(groups.values());
};

export const tasksOfView = (view: TaskView, tasks: Task[]) => {
  const listId = listIdOfView(view);
  if (listId !== undefined) return tasks.filter((task) => task.listId === listId);
  if (view === "completed") return tasks.filter((task) => task.completedAt);
  return tasks;
};

export const countOpen = (view: TaskView, tasks: Task[]): number => {
  const open = tasks.filter((task) => !task.completedAt);
  const today = todayISO();
  switch (view) {
    case "today":
      return open.filter((task) => task.dueDate && task.dueDate <= today).length;
    case "upcoming":
      return open.filter((task) => task.dueDate && task.dueDate > today).length;
    case "important":
      return open.filter((task) => task.isImportant).length;
    case "all":
      return open.length;
    case "completed":
      return 0;
    default:
      return open.filter((task) => task.listId === listIdOfView(view)).length;
  }
};

export const viewTitle = (view: TaskView, lists: TaskList[]) => {
  if (view === "inbox") return INBOX_LABEL;
  const listId = listIdOfView(view);
  if (listId) return lists.find((list) => list.id === listId)?.name ?? "Lista";
  return SMART_VIEW_LABELS[view as SmartView];
};

export const newSubtaskId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
