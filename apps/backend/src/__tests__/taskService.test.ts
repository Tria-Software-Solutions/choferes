jest.mock("../models/Task", () => ({
  __esModule: true,
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));
jest.mock("../models/TaskList", () => ({
  __esModule: true,
  default: { findOne: jest.fn(), findAll: jest.fn(), create: jest.fn(), update: jest.fn() },
}));
jest.mock("../models/User", () => ({ User: { findAll: jest.fn() } }));
jest.mock("../models/Notification", () => ({ Notification: { create: jest.fn() } }));

import Task from "../models/Task";
import TaskList from "../models/TaskList";
import { User } from "../models/User";
import { Notification } from "../models/Notification";
import {
  buildNextOccurrence,
  deleteTask,
  dispatchDueReminders,
  nextOccurrence,
  updateTask,
} from "../services/taskService";

const TaskMock = Task as unknown as Record<string, jest.Mock>;
const TaskListMock = TaskList as unknown as Record<string, jest.Mock>;
const UserMock = User as unknown as Record<string, jest.Mock>;
const NotificationMock = Notification as unknown as Record<string, jest.Mock>;

const taskRow = (overrides: Record<string, unknown> = {}) => {
  const state: Record<string, unknown> = {
    id: 1,
    userId: 5,
    listId: null,
    title: "Pagar marchamo",
    notes: null,
    dueDate: "2026-09-30",
    dueTime: null,
    remindAt: null,
    reminderSentAt: null,
    priority: 0,
    isImportant: false,
    recurrence: "none",
    subtasks: [],
    position: 0,
    completedAt: null,
    ...overrides,
  };
  return {
    ...state,
    update: jest.fn(async (values: Record<string, unknown>) => Object.assign(state, values)),
    get: jest.fn(() => ({ ...state })),
  };
};

beforeEach(() => jest.clearAllMocks());

describe("nextOccurrence", () => {
  it("avanza según la recurrencia", () => {
    expect(nextOccurrence("2026-09-30", "daily")).toBe("2026-10-01");
    expect(nextOccurrence("2026-09-30", "weekly")).toBe("2026-10-07");
    expect(nextOccurrence("2026-01-31", "monthly")).toBe("2026-02-28");
    expect(nextOccurrence("2028-02-29", "yearly")).toBe("2029-02-28");
  });

  it("salta fines de semana en días laborables", () => {
    expect(nextOccurrence("2026-10-02", "weekdays")).toBe("2026-10-05"); // viernes → lunes
  });
});

describe("buildNextOccurrence", () => {
  it("no crea nada para tareas sin recurrencia", () => {
    expect(buildNextOccurrence(taskRow() as never)).toBeNull();
  });

  it("mueve fecha y recordatorio y desmarca los pasos", () => {
    const next = buildNextOccurrence(
      taskRow({
        recurrence: "weekly",
        remindAt: new Date("2026-09-30T14:00:00.000Z"),
        subtasks: [{ id: "a", title: "Paso", done: true }],
      }) as never,
      new Date("2026-09-30T15:00:00.000Z"),
    );
    expect(next?.dueDate).toBe("2026-10-07");
    expect((next?.remindAt as Date).toISOString()).toBe("2026-10-07T14:00:00.000Z");
    expect(next?.subtasks).toEqual([{ id: "a", title: "Paso", done: false }]);
    expect(next?.completedAt).toBeNull();
  });

  it("salta ocurrencias cuyo recordatorio ya pasó", () => {
    const next = buildNextOccurrence(
      taskRow({ recurrence: "daily", remindAt: new Date("2026-09-01T14:00:00.000Z"), dueDate: "2026-09-01" }) as never,
      new Date("2026-09-10T15:00:00.000Z"),
    );
    expect(next?.dueDate).toBe("2026-09-11");
  });
});

describe("updateTask", () => {
  it("devuelve null para tareas de otro usuario", async () => {
    TaskMock.findOne.mockResolvedValue(null);
    expect(await updateTask(5, 99, { title: "x" })).toBeNull();
    expect(TaskMock.findOne).toHaveBeenCalledWith({ where: { id: 99, userId: 5 } });
  });

  it("rechaza mover la tarea a una lista ajena", async () => {
    TaskMock.findOne.mockResolvedValue(taskRow());
    TaskListMock.findOne.mockResolvedValue(null);
    await expect(updateTask(5, 1, { listId: 42 })).rejects.toMatchObject({ statusCode: 404 });
  });

  it("al mover el recordatorio lo vuelve a armar", async () => {
    const row = taskRow({ remindAt: new Date("2026-09-30T14:00:00.000Z"), reminderSentAt: new Date() });
    TaskMock.findOne.mockResolvedValue(row);
    await updateTask(5, 1, { remindAt: "2026-10-01T14:00:00.000Z" });
    expect(row.update).toHaveBeenCalledWith(expect.objectContaining({ reminderSentAt: null }));
  });

  it("completar una tarea recurrente crea la siguiente", async () => {
    TaskMock.findOne.mockResolvedValue(taskRow({ recurrence: "daily" }));
    TaskMock.create.mockImplementation(async (values: Record<string, unknown>) => ({
      get: () => ({ id: 2, ...values }),
    }));
    const result = await updateTask(5, 1, { completed: true });
    expect(result?.task.completedAt).toBeInstanceOf(Date);
    expect(result?.next).toMatchObject({ id: 2, dueDate: "2026-10-01", completedAt: null });
  });
});

describe("deleteTask", () => {
  it("borra solo dentro del alcance del usuario", async () => {
    TaskMock.destroy.mockResolvedValue(1);
    expect(await deleteTask(5, 1)).toBe(true);
    expect(TaskMock.destroy).toHaveBeenCalledWith({ where: { id: 1, userId: 5 } });
  });
});

describe("dispatchDueReminders", () => {
  const now = new Date("2026-09-30T15:00:00.000Z");

  it("crea una notificación por recordatorio vencido y lo marca como enviado", async () => {
    TaskMock.findAll.mockResolvedValue([
      taskRow({ remindAt: new Date("2026-09-30T14:59:00.000Z"), priority: 3 }),
    ]);
    UserMock.findAll.mockResolvedValue([{ id: 5, settings: {} }]);
    TaskMock.update.mockResolvedValue([1]);
    NotificationMock.create.mockResolvedValue({});

    const sent = await dispatchDueReminders({ now });

    expect(sent).toBe(1);
    expect(TaskMock.update).toHaveBeenCalledWith(
      { reminderSentAt: now },
      { where: { id: 1, reminderSentAt: null } },
    );
    expect(NotificationMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        title: "Recordatorio: Pagar marchamo",
        category: "task",
        priority: "high",
        actionUrl: "/tasks?task=1",
      }),
    );
  });

  it("no notifica dos veces si otra ejecución ya lo reclamó", async () => {
    TaskMock.findAll.mockResolvedValue([taskRow({ remindAt: new Date("2026-09-30T14:59:00.000Z") })]);
    UserMock.findAll.mockResolvedValue([{ id: 5, settings: {} }]);
    TaskMock.update.mockResolvedValue([0]);

    expect(await dispatchDueReminders({ now })).toBe(0);
    expect(NotificationMock.create).not.toHaveBeenCalled();
  });

  it("respeta a quien desactivó las notificaciones de tareas", async () => {
    TaskMock.findAll.mockResolvedValue([taskRow({ remindAt: new Date("2026-09-30T14:59:00.000Z") })]);
    UserMock.findAll.mockResolvedValue([{ id: 5, settings: { notifications: { tasks: false } } }]);
    TaskMock.update.mockResolvedValue([1]);

    expect(await dispatchDueReminders({ now })).toBe(0);
    expect(NotificationMock.create).not.toHaveBeenCalled();
  });
});
