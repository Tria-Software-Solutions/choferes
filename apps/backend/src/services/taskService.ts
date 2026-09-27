// Personal to-do lists ("Tareas"): every query is scoped to the owner, so a
// user can never read or change someone else's lists or tasks.
import Task, { TaskRecurrence, TaskSubtask } from "../models/Task";
import TaskList from "../models/TaskList";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import { ServiceError } from "../utils/errors";
import { localDateString, parseISODate, toISODate } from "../utils/timezone";

export const TASK_RECURRENCES: readonly TaskRecurrence[] = [
  "none",
  "daily",
  "weekdays",
  "weekly",
  "monthly",
  "yearly",
];

export const TASK_LIST_COLORS = ["indigo", "sky", "emerald", "amber", "rose", "violet", "slate"];

const DAY_MS = 24 * 60 * 60 * 1000;

// Sequelize 4 typings do not declare instance methods on the model class.
type Row<T> = T & {
  update: (values: Record<string, unknown>) => Promise<unknown>;
  destroy: () => Promise<unknown>;
  get: (options: { plain: true }) => Record<string, unknown>;
};

const plain = <T extends { get: (options: { plain: true }) => Record<string, unknown> }>(row: T) =>
  row.get({ plain: true });

// ─── Lists ───────────────────────────────────────────────────────────────────

export const getLists = async (userId: number) =>
  (
    await TaskList.findAll({
      where: { userId },
      order: [
        ["position", "ASC"],
        ["id", "ASC"],
      ],
    })
  ).map((row) => plain(row as Row<TaskList>));

const findOwnList = async (userId: number, id: number) => {
  const list = await TaskList.findOne({ where: { id, userId } });
  return list as Row<TaskList> | null;
};

export const createList = async (userId: number, input: { name: string; color?: string }) => {
  const last = await TaskList.findOne({ where: { userId }, order: [["position", "DESC"]] });
  const list = await TaskList.create({
    userId,
    name: input.name.trim(),
    color: input.color && TASK_LIST_COLORS.includes(input.color) ? input.color : "indigo",
    position: last ? Number(last.position) + 1 : 0,
  });
  return plain(list as Row<TaskList>);
};

export const updateList = async (
  userId: number,
  id: number,
  input: { name?: string; color?: string },
) => {
  const list = await findOwnList(userId, id);
  if (!list) return null;
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.color !== undefined && TASK_LIST_COLORS.includes(input.color)) {
    updates.color = input.color;
  }
  await list.update(updates);
  return plain(list);
};

// Deleting a list deletes its tasks (like Microsoft To Do / Todoist).
export const deleteList = async (userId: number, id: number) => {
  const list = await findOwnList(userId, id);
  if (!list) return false;
  await Task.destroy({ where: { userId, listId: id } });
  await list.destroy();
  return true;
};

export const reorderLists = async (userId: number, ids: number[]) => {
  await Promise.all(
    ids.map((id, position) => TaskList.update({ position }, { where: { id, userId } })),
  );
  return getLists(userId);
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface TaskInput {
  title?: string;
  notes?: string | null;
  listId?: number | null;
  dueDate?: string | null;
  dueTime?: string | null;
  remindAt?: string | null;
  priority?: number;
  isImportant?: boolean;
  recurrence?: TaskRecurrence;
  subtasks?: TaskSubtask[];
  completed?: boolean;
}

export const getTasks = async (userId: number) =>
  (
    await Task.findAll({
      where: { userId },
      order: [
        ["position", "ASC"],
        ["createdAt", "DESC"],
      ],
    })
  ).map((row) => plain(row as Row<Task>));

const findOwnTask = async (userId: number, id: number) =>
  (await Task.findOne({ where: { id, userId } })) as Row<Task> | null;

const assertOwnList = async (userId: number, listId: number | null | undefined) => {
  if (listId === undefined || listId === null) return;
  const list = await TaskList.findOne({ where: { id: listId, userId } });
  if (!list) throw new ServiceError(404, "Lista no encontrada");
};

const normalizeSubtasks = (subtasks: TaskSubtask[] | undefined): TaskSubtask[] | undefined =>
  subtasks?.map((step) => ({
    id: String(step.id).slice(0, 50),
    title: String(step.title).trim().slice(0, 300),
    done: Boolean(step.done),
  }));

const editableColumns = (input: TaskInput): Record<string, unknown> => {
  const columns: Record<string, unknown> = {};
  if (input.title !== undefined) columns.title = input.title.trim();
  if (input.notes !== undefined) columns.notes = input.notes?.trim() ? input.notes : null;
  if (input.listId !== undefined) columns.listId = input.listId;
  if (input.dueDate !== undefined) columns.dueDate = input.dueDate || null;
  if (input.dueTime !== undefined) columns.dueTime = input.dueTime || null;
  if (input.remindAt !== undefined)
    columns.remindAt = input.remindAt ? new Date(input.remindAt) : null;
  if (input.priority !== undefined) columns.priority = input.priority;
  if (input.isImportant !== undefined) columns.isImportant = input.isImportant;
  if (input.recurrence !== undefined) columns.recurrence = input.recurrence;
  if (input.subtasks !== undefined) columns.subtasks = normalizeSubtasks(input.subtasks);
  return columns;
};

export const createTask = async (userId: number, input: TaskInput) => {
  await assertOwnList(userId, input.listId);
  // New tasks go on top of their list.
  const first = await Task.findOne({
    where: { userId, listId: input.listId ?? null },
    order: [["position", "ASC"]],
  });
  const task = await Task.create({
    userId,
    ...editableColumns(input),
    position: first ? Number(first.position) - 1 : 0,
    completedAt: input.completed ? new Date() : null,
  });
  return plain(task as Row<Task>);
};

const addMonthsClamped = (date: Date, months: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
};

/** Next occurrence (YYYY-MM-DD) of a recurring due date. */
export const nextOccurrence = (dueDate: string, recurrence: TaskRecurrence): string => {
  const date = parseISODate(dueDate);
  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      return toISODate(date);
    case "weekdays": {
      do {
        date.setDate(date.getDate() + 1);
      } while (date.getDay() === 0 || date.getDay() === 6);
      return toISODate(date);
    }
    case "weekly":
      date.setDate(date.getDate() + 7);
      return toISODate(date);
    case "monthly":
      return toISODate(addMonthsClamped(date, 1));
    case "yearly":
      return toISODate(addMonthsClamped(date, 12));
    default:
      return dueDate;
  }
};

const daysBetween = (from: string, to: string): number =>
  Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / DAY_MS);

/**
 * Builds the next occurrence of a completed recurring task: due date advanced
 * by the recurrence (from its due date, or from today when it had none), the
 * reminder moved by the same number of days, steps unchecked. Occurrences
 * whose reminder would already be in the past are skipped so completing an
 * overdue task never fires a stale reminder.
 */
export const buildNextOccurrence = (
  task: Task,
  now: Date = new Date(),
): Record<string, unknown> | null => {
  if (!task.recurrence || task.recurrence === "none") return null;

  const baseDue = task.dueDate || localDateString(now);
  let nextDue = nextOccurrence(baseDue, task.recurrence);
  let remindAt: Date | null = null;
  if (task.remindAt) {
    const shift = (due: string) =>
      new Date(new Date(task.remindAt as Date).getTime() + daysBetween(baseDue, due) * DAY_MS);
    remindAt = shift(nextDue);
    for (let guard = 0; remindAt.getTime() <= now.getTime() && guard < 1000; guard += 1) {
      nextDue = nextOccurrence(nextDue, task.recurrence);
      remindAt = shift(nextDue);
    }
  }

  return {
    userId: task.userId,
    listId: task.listId ?? null,
    title: task.title,
    notes: task.notes ?? null,
    dueDate: nextDue,
    dueTime: task.dueTime ?? null,
    remindAt,
    reminderSentAt: null,
    priority: task.priority,
    isImportant: task.isImportant,
    recurrence: task.recurrence,
    subtasks: (task.subtasks ?? []).map((step) => ({ ...step, done: false })),
    position: task.position,
    completedAt: null,
  };
};

/**
 * Partial update. Moving the reminder re-arms it; completing a recurring task
 * creates its next occurrence (returned as `next`).
 */
export const updateTask = async (userId: number, id: number, input: TaskInput) => {
  const task = await findOwnTask(userId, id);
  if (!task) return null;
  await assertOwnList(userId, input.listId);

  const updates = editableColumns(input);
  if (
    input.remindAt !== undefined &&
    String(updates.remindAt ?? "") !== String(task.remindAt ?? "")
  ) {
    updates.reminderSentAt = null;
  }

  let next: Record<string, unknown> | null = null;
  if (input.completed === true && !task.completedAt) {
    updates.completedAt = new Date();
    const occurrence = buildNextOccurrence({ ...plain(task), ...updates } as unknown as Task);
    if (occurrence) {
      next = plain((await Task.create(occurrence)) as Row<Task>);
    }
  } else if (input.completed === false && task.completedAt) {
    updates.completedAt = null;
  }

  await task.update(updates);
  return { task: plain(task), next };
};

export const deleteTask = async (userId: number, id: number) => {
  const deleted = await Task.destroy({ where: { id, userId } });
  return deleted > 0;
};

export const reorderTasks = async (userId: number, ids: number[]) => {
  await Promise.all(
    ids.map((id, position) => Task.update({ position }, { where: { id, userId } })),
  );
  return true;
};

// Removes the completed tasks of a list (or of every list when listId is
// omitted; `null` targets the default "Tareas" list).
export const clearCompleted = async (userId: number, listId?: number | null) => {
  const where: Record<string, unknown> = { userId, completedAt: { $ne: null } };
  if (listId !== undefined) where.listId = listId;
  return Task.destroy({ where });
};

// ─── Reminders ───────────────────────────────────────────────────────────────

const describeDue = (task: Task): string => {
  if (!task.dueDate) return "";
  const today = localDateString();
  const [year, month, day] = task.dueDate.split("-");
  let when = `el ${day}/${month}/${year}`;
  if (task.dueDate === today) when = "hoy";
  else if (task.dueDate < today) when = `desde el ${day}/${month}/${year}`;
  return `Vence ${when}${task.dueTime ? ` a las ${task.dueTime}` : ""}.`;
};

const reminderMessage = (task: Task): string => {
  const due = describeDue(task);
  const note = task.notes
    ?.split("\n")
    .find((line) => line.trim())
    ?.trim();
  const parts = [due, note ? note.slice(0, 180) : ""].filter(Boolean);
  return parts.join(" ") || "Tienes un recordatorio pendiente.";
};

/**
 * Turns due reminders into in-app notifications. Each reminder is claimed
 * with a conditional update first, so concurrent runs (job + request) never
 * notify twice. Users who disabled "tasks" notifications are skipped silently.
 */
export const dispatchDueReminders = async (
  options: { userId?: number; now?: Date; limit?: number } = {},
): Promise<number> => {
  const now = options.now ?? new Date();
  const where: Record<string, unknown> = {
    remindAt: { $lte: now },
    reminderSentAt: null,
    completedAt: null,
  };
  if (options.userId) where.userId = options.userId;

  const due = (await Task.findAll({
    where,
    order: [["remindAt", "ASC"]],
    limit: options.limit ?? 200,
  })) as Task[];
  if (due.length === 0) return 0;

  const userIds = Array.from(new Set(due.map((task) => task.userId)));
  const users = await User.findAll({ where: { id: { $in: userIds } } });
  const enabled = new Map(
    users.map((user) => {
      const settings = (user.settings as Record<string, any> | undefined)?.notifications;
      return [user.id, settings?.tasks !== false];
    }),
  );

  let sent = 0;
  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const task of due) {
    const [claimed] = (await Task.update(
      { reminderSentAt: now },
      { where: { id: task.id, reminderSentAt: null } },
    )) as unknown as [number];
    if (claimed === 1 && enabled.get(task.userId)) {
      try {
        await Notification.create({
          userId: task.userId,
          title: `Recordatorio: ${task.title}`.slice(0, 250),
          message: reminderMessage(task),
          type: task.priority >= 3 ? "warning" : "info",
          category: "task",
          priority: task.priority >= 3 ? "high" : "medium",
          actionUrl: `/tasks?task=${task.id}`,
          actionText: "Ver tarea",
          source: `task-reminder:${task.id}:${new Date(task.remindAt as Date).getTime()}`,
        });
        sent += 1;
      } catch (error) {
        if ((error as { name?: string }).name !== "SequelizeUniqueConstraintError") throw error;
      }
    }
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */
  return sent;
};
