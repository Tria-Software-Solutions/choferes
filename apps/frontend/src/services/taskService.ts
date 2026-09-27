import api from "./api";
import { Task, TaskInput, TaskList, TaskListColor } from "../models/Task";

// Personal to-do lists. Every call is scoped server-side to the signed-in user.
// Requests bypass the GET cache (fresh data after each mutation).
const fresh = () => ({ params: { _t: Date.now() } });

export const getTasks = async (): Promise<Task[]> => (await api.get("/tasks", fresh())).data;

export const createTask = async (input: TaskInput): Promise<Task> =>
  (await api.post("/tasks", input)).data;

export const updateTask = async (
  id: number,
  input: TaskInput,
): Promise<{ task: Task; next: Task | null }> => (await api.put(`/tasks/${id}`, input)).data;

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const reorderTasks = async (ids: number[]): Promise<void> => {
  await api.put("/tasks/reorder", { ids });
};

/** listId: a list id, "inbox" (default list) or undefined (every list). */
export const clearCompletedTasks = async (listId?: number | "inbox"): Promise<number> =>
  (await api.delete("/tasks/completed", { params: listId === undefined ? {} : { listId } })).data
    .deleted;

export const getTaskLists = async (): Promise<TaskList[]> =>
  (await api.get("/task-lists", fresh())).data;

export const createTaskList = async (input: {
  name: string;
  color?: TaskListColor;
}): Promise<TaskList> => (await api.post("/task-lists", input)).data;

export const updateTaskList = async (
  id: number,
  input: { name?: string; color?: TaskListColor },
): Promise<TaskList> => (await api.put(`/task-lists/${id}`, input)).data;

export const deleteTaskList = async (id: number): Promise<void> => {
  await api.delete(`/task-lists/${id}`);
};
