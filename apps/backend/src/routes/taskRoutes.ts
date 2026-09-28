import express from "express";
import * as taskController from "../controllers/taskController";
import { authenticateToken } from "../middleware/authMiddleware";
import { requirePermission } from "../middleware/authorize";
import { PERMISSION_CODES } from "../constants/permissions";
import {
  clearCompletedRules,
  idParam,
  reorderRules,
  taskCreateRules,
  taskListRules,
  taskListUpdateRules,
  taskUpdateRules,
  validate,
} from "../middleware/validation";

// Personal to-do lists: gated by the "Tareas" permissions (granted to every
// seeded role); each user only ever sees their own lists and tasks (scoped in
// the service).
export const taskRouter = express.Router();
export const taskListRouter = express.Router();

const canView = requirePermission(PERMISSION_CODES.VIEW_TASKS);
const canCreate = requirePermission(PERMISSION_CODES.CREATE_TASK);
const canEdit = requirePermission(PERMISSION_CODES.EDIT_TASK);
const canDelete = requirePermission(PERMISSION_CODES.DELETE_TASK);

taskRouter.use(authenticateToken);
taskListRouter.use(authenticateToken);

taskRouter.get("/", canView, taskController.getTasks);
taskRouter.post("/", canCreate, taskCreateRules, validate, taskController.createTask);
taskRouter.put("/reorder", canEdit, reorderRules, validate, taskController.reorderTasks);
taskRouter.delete(
  "/completed",
  canDelete,
  clearCompletedRules,
  validate,
  taskController.clearCompleted,
);
taskRouter.put("/:id", canEdit, taskUpdateRules, validate, taskController.updateTask);
taskRouter.delete("/:id", canDelete, idParam, validate, taskController.deleteTask);

taskListRouter.get("/", canView, taskController.getLists);
taskListRouter.post("/", canCreate, taskListRules, validate, taskController.createList);
taskListRouter.put("/reorder", canEdit, reorderRules, validate, taskController.reorderLists);
taskListRouter.put("/:id", canEdit, taskListUpdateRules, validate, taskController.updateList);
taskListRouter.delete("/:id", canDelete, idParam, validate, taskController.deleteList);
