import express from "express";
import * as taskController from "../controllers/taskController";
import { authenticateToken } from "../middleware/authMiddleware";
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

// Personal to-do lists: available to every authenticated user; each user only
// ever sees their own lists and tasks (scoped in the service).
export const taskRouter = express.Router();
export const taskListRouter = express.Router();

taskRouter.use(authenticateToken);
taskListRouter.use(authenticateToken);

taskRouter.get("/", taskController.getTasks);
taskRouter.post("/", taskCreateRules, validate, taskController.createTask);
taskRouter.put("/reorder", reorderRules, validate, taskController.reorderTasks);
taskRouter.delete("/completed", clearCompletedRules, validate, taskController.clearCompleted);
taskRouter.put("/:id", taskUpdateRules, validate, taskController.updateTask);
taskRouter.delete("/:id", idParam, validate, taskController.deleteTask);

taskListRouter.get("/", taskController.getLists);
taskListRouter.post("/", taskListRules, validate, taskController.createList);
taskListRouter.put("/reorder", reorderRules, validate, taskController.reorderLists);
taskListRouter.put("/:id", taskListUpdateRules, validate, taskController.updateList);
taskListRouter.delete("/:id", idParam, validate, taskController.deleteList);
