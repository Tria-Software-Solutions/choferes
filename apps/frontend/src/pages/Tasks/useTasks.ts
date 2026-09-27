import { useCallback, useEffect, useRef, useState } from "react";
import { Task, TaskInput, TaskList, TaskListColor } from "../../models/Task";
import * as TaskService from "../../services/taskService";
import { getApiErrorMessage } from "../../utils/apiError";
import { useAppNotifications } from "../../components/Snackbar/Snackbar.component";

// Page-local store for the to-do lists: optimistic updates (the UI reacts
// instantly) with rollback + a toast when the API rejects a change.
export const useTasks = () => {
  const { showNotification } = useAppNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = tasks;

  const fail = useCallback(
    (error: unknown, fallback: string) =>
      showNotification(getApiErrorMessage(error, fallback), { severity: "error" }),
    [showNotification],
  );

  const reload = useCallback(async () => {
    setLoadError(null);
    try {
      const [taskRows, listRows] = await Promise.all([
        TaskService.getTasks(),
        TaskService.getTaskLists(),
      ]);
      setTasks(taskRows);
      setLists(listRows);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "No se pudieron cargar tus tareas"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addTask = useCallback(
    async (input: TaskInput) => {
      try {
        const created = await TaskService.createTask(input);
        setTasks((prev) => [created, ...prev]);
        return created;
      } catch (error) {
        fail(error, "No se pudo crear la tarea");
        return null;
      }
    },
    [fail],
  );

  const patchTask = useCallback(
    async (id: number, input: TaskInput) => {
      const previous = tasksRef.current.find((task) => task.id === id);
      if (!previous) return;
      const optimistic: Partial<Task> = { ...input } as Partial<Task>;
      delete (optimistic as { completed?: boolean }).completed;
      if (input.completed === true) optimistic.completedAt = new Date().toISOString();
      if (input.completed === false) optimistic.completedAt = null;
      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...optimistic } : task)));
      try {
        const { task, next } = await TaskService.updateTask(id, input);
        setTasks((prev) => {
          const updated = prev.map((item) => (item.id === id ? task : item));
          return next ? [next, ...updated] : updated;
        });
        if (next) {
          showNotification("Tarea completada: se programó la siguiente repetición", {
            severity: "success",
          });
        }
      } catch (error) {
        setTasks((prev) => prev.map((task) => (task.id === id ? previous : task)));
        fail(error, "No se pudo actualizar la tarea");
      }
    },
    [fail, showNotification],
  );

  const removeTask = useCallback(
    async (id: number) => {
      const previous = tasksRef.current;
      setTasks((prev) => prev.filter((task) => task.id !== id));
      try {
        await TaskService.deleteTask(id);
      } catch (error) {
        setTasks(previous);
        fail(error, "No se pudo eliminar la tarea");
      }
    },
    [fail],
  );

  const duplicateTask = useCallback(
    async (task: Task) =>
      addTask({
        title: `${task.title} (copia)`,
        notes: task.notes,
        listId: task.listId,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        isImportant: task.isImportant,
        recurrence: task.recurrence,
        subtasks: task.subtasks.map((step) => ({ ...step, done: false })),
      }),
    [addTask],
  );

  const reorder = useCallback(
    async (orderedIds: number[]) => {
      const positions = new Map(orderedIds.map((id, index) => [id, index]));
      const previous = tasksRef.current;
      setTasks((prev) =>
        prev.map((task) =>
          positions.has(task.id) ? { ...task, position: positions.get(task.id) as number } : task,
        ),
      );
      try {
        await TaskService.reorderTasks(orderedIds);
      } catch (error) {
        setTasks(previous);
        fail(error, "No se pudo guardar el orden");
      }
    },
    [fail],
  );

  const clearCompleted = useCallback(
    async (listId?: number | "inbox") => {
      const previous = tasksRef.current;
      const matches = (task: Task) =>
        Boolean(task.completedAt) &&
        (listId === undefined || (listId === "inbox" ? task.listId === null : task.listId === listId));
      setTasks((prev) => prev.filter((task) => !matches(task)));
      try {
        await TaskService.clearCompletedTasks(listId);
      } catch (error) {
        setTasks(previous);
        fail(error, "No se pudieron borrar las completadas");
      }
    },
    [fail],
  );

  const addList = useCallback(
    async (name: string, color: TaskListColor) => {
      try {
        const list = await TaskService.createTaskList({ name, color });
        setLists((prev) => [...prev, list]);
        return list;
      } catch (error) {
        fail(error, "No se pudo crear la lista");
        return null;
      }
    },
    [fail],
  );

  const editList = useCallback(
    async (id: number, input: { name?: string; color?: TaskListColor }) => {
      try {
        const list = await TaskService.updateTaskList(id, input);
        setLists((prev) => prev.map((item) => (item.id === id ? list : item)));
      } catch (error) {
        fail(error, "No se pudo actualizar la lista");
      }
    },
    [fail],
  );

  const removeList = useCallback(
    async (id: number) => {
      try {
        await TaskService.deleteTaskList(id);
        setLists((prev) => prev.filter((list) => list.id !== id));
        setTasks((prev) => prev.filter((task) => task.listId !== id));
        return true;
      } catch (error) {
        fail(error, "No se pudo eliminar la lista");
        return false;
      }
    },
    [fail],
  );

  return {
    tasks,
    lists,
    isLoading,
    loadError,
    reload,
    addTask,
    patchTask,
    removeTask,
    duplicateTask,
    reorder,
    clearCompleted,
    addList,
    editList,
    removeList,
  };
};

export type TasksStore = ReturnType<typeof useTasks>;
