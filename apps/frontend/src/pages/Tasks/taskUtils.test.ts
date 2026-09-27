import { addDays, format } from "date-fns";
import { Task } from "../../models/Task";
import { countOpen, groupOpenTasks, isOverdue, matchesSearch, sortTasks } from "./taskUtils";

const day = (offset: number) => format(addDays(new Date(), offset), "yyyy-MM-dd");

const task = (overrides: Partial<Task>): Task => ({
  id: 1,
  userId: 1,
  listId: null,
  title: "Tarea",
  notes: null,
  dueDate: null,
  dueTime: null,
  remindAt: null,
  reminderSentAt: null,
  priority: 0,
  isImportant: false,
  recurrence: "none",
  subtasks: [],
  position: 0,
  completedAt: null,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
  ...overrides,
});

describe("vistas de tareas", () => {
  const tasks = [
    task({ id: 1, dueDate: day(-2), title: "Vencida" }),
    task({ id: 2, dueDate: day(0), title: "Hoy", isImportant: true }),
    task({ id: 3, dueDate: day(3), title: "Luego", listId: 7 }),
    task({ id: 4, title: "Sin fecha", completedAt: "2026-09-02T00:00:00.000Z" }),
  ];

  it("Hoy agrupa vencidas y de hoy", () => {
    const groups = groupOpenTasks("today", tasks.filter((t) => !t.completedAt), "manual");
    expect(groups.map((g) => g.key)).toEqual(["overdue", day(0)]);
    expect(groups[0].tasks.map((t) => t.id)).toEqual([1]);
  });

  it("cuenta pendientes por vista", () => {
    expect(countOpen("today", tasks)).toBe(2);
    expect(countOpen("upcoming", tasks)).toBe(1);
    expect(countOpen("important", tasks)).toBe(1);
    expect(countOpen("all", tasks)).toBe(3);
    expect(countOpen("list:7", tasks)).toBe(1);
    expect(countOpen("inbox", tasks)).toBe(2);
  });

  it("detecta vencidas y busca en título, notas y pasos", () => {
    expect(isOverdue(tasks[0])).toBe(true);
    expect(isOverdue(tasks[2])).toBe(false);
    expect(matchesSearch(task({ notes: "llamar al taller" }), "taller")).toBe(true);
    expect(matchesSearch(task({ subtasks: [{ id: "a", title: "Comprar aceite", done: false }] }), "aceite")).toBe(true);
    expect(matchesSearch(task({ title: "Otra" }), "taller")).toBe(false);
  });

  it("ordena por prioridad y por fecha", () => {
    const list = [
      task({ id: 1, priority: 1, dueDate: day(2) }),
      task({ id: 2, priority: 3, dueDate: day(5) }),
      task({ id: 3, priority: 0, dueDate: day(1) }),
    ];
    expect(sortTasks(list, "priority").map((t) => t.id)).toEqual([2, 1, 3]);
    expect(sortTasks(list, "dueDate").map((t) => t.id)).toEqual([3, 1, 2]);
  });
});
