// Controller for the personal to-do lists ("Tareas"). Every handler works on
// the authenticated user's own data only.
import { Request, Response } from "express";
import * as taskService from "../services/taskService";
import { isServiceError, sendServerError } from "../utils/errors";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

const getUserId = (req: Request): number => (req as AuthenticatedRequest).user?.id ?? 0;

const handleError = (res: Response, error: unknown, fallback: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallback, error);
};

const withUser =
  (handler: (req: Request, res: Response, userId: number) => Promise<Response>, fallback: string) =>
  async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      return await handler(req, res, userId);
    } catch (error) {
      return handleError(res, error, fallback);
    }
  };

// ─── Lists ───────────────────────────────────────────────────────────────────

export const getLists = withUser(
  async (_req, res, userId) => res.status(200).json(await taskService.getLists(userId)),
  "Error fetching task lists",
);

export const createList = withUser(
  async (req, res, userId) => res.status(201).json(await taskService.createList(userId, req.body)),
  "Error creating task list",
);

export const updateList = withUser(async (req, res, userId) => {
  const list = await taskService.updateList(userId, Number(req.params.id), req.body);
  return list
    ? res.status(200).json(list)
    : res.status(404).json({ message: "Lista no encontrada" });
}, "Error updating task list");

export const deleteList = withUser(async (req, res, userId) => {
  const deleted = await taskService.deleteList(userId, Number(req.params.id));
  return deleted ? res.status(204).end() : res.status(404).json({ message: "Lista no encontrada" });
}, "Error deleting task list");

export const reorderLists = withUser(
  async (req, res, userId) =>
    res
      .status(200)
      .json(await taskService.reorderLists(userId, (req.body.ids as unknown[]).map(Number))),
  "Error reordering task lists",
);

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const getTasks = withUser(
  async (_req, res, userId) => res.status(200).json(await taskService.getTasks(userId)),
  "Error fetching tasks",
);

export const createTask = withUser(
  async (req, res, userId) => res.status(201).json(await taskService.createTask(userId, req.body)),
  "Error creating task",
);

export const updateTask = withUser(async (req, res, userId) => {
  const result = await taskService.updateTask(userId, Number(req.params.id), req.body);
  return result
    ? res.status(200).json(result)
    : res.status(404).json({ message: "Tarea no encontrada" });
}, "Error updating task");

export const deleteTask = withUser(async (req, res, userId) => {
  const deleted = await taskService.deleteTask(userId, Number(req.params.id));
  return deleted ? res.status(204).end() : res.status(404).json({ message: "Tarea no encontrada" });
}, "Error deleting task");

export const reorderTasks = withUser(async (req, res, userId) => {
  await taskService.reorderTasks(userId, (req.body.ids as unknown[]).map(Number));
  return res.status(204).end();
}, "Error reordering tasks");

// DELETE /tasks/completed?listId=<id|inbox> — without listId clears every list.
export const clearCompleted = withUser(async (req, res, userId) => {
  const raw = req.query.listId as string | undefined;
  let listId: number | null | undefined;
  if (raw === "inbox") listId = null;
  else if (raw !== undefined) listId = Number(raw);
  const deleted = await taskService.clearCompleted(userId, listId);
  return res.status(200).json({ deleted });
}, "Error clearing completed tasks");
