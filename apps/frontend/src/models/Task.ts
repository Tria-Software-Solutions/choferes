/** Personal to-do list types (page "Tareas") — mirror the backend tables. */

export type TaskRecurrence = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "yearly";

export type TaskPriority = 0 | 1 | 2 | 3;

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: number;
  userId: number;
  listId: number | null;
  title: string;
  notes: string | null;
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:mm
  remindAt: string | null; // ISO instant
  reminderSentAt: string | null;
  priority: TaskPriority;
  isImportant: boolean;
  recurrence: TaskRecurrence;
  subtasks: TaskSubtask[];
  position: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskListColor = "indigo" | "sky" | "emerald" | "amber" | "rose" | "violet" | "slate";

export interface TaskList {
  id: number;
  userId: number;
  name: string;
  color: TaskListColor;
  position: number;
}

export type TaskInput = Partial<
  Pick<
    Task,
    | "title"
    | "notes"
    | "listId"
    | "dueDate"
    | "dueTime"
    | "remindAt"
    | "priority"
    | "isImportant"
    | "recurrence"
    | "subtasks"
  >
> & { completed?: boolean };
