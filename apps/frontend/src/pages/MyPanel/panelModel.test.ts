import type { MyPanelOverview, MyPanelWeekDay } from "../../models/MyPanel";
import type { Task } from "../../models/Task";
import {
  biweekLabel,
  biweekShortLabel,
  describeDue,
  diffDays,
  formatDateRange,
  formatHours,
  getAttentionItems,
  getShiftFacts,
  getTabAlerts,
  hasDrivingPosition,
  isAssigned,
  isPanelTabKey,
  resolvePanelTab,
  latestPayment,
  relativeDayLabel,
  shortTenure,
  sortTasks,
} from "./panelModel";

const overviewOf = (partial: Partial<MyPanelOverview> = {}): MyPanelOverview => ({
  linked: true,
  vacations: [],
  disciplinaryActions: [],
  licenses: [],
  licenseRequests: [],
  payments: [],
  tasks: [],
  summaries: { weekly: null, biweekly: null, monthly: null },
  history: { weekly: [] },
  ...partial,
});

const taskOf = (partial: Partial<Task>): Task => ({
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
  createdAt: "",
  updatedAt: "",
  ...partial,
});

// Un día con lugar asignado (hours > 0 o label) o libre (label null).
const dayOf = (date: string, day: string, hours: number, label: string | null): MyPanelWeekDay => ({
  date,
  day,
  hours,
  scheduleId: label ? label.length : null,
  scheduleLabel: label,
});

describe("fechas", () => {
  it("cuenta días de calendario entre dos fechas", () => {
    expect(diffDays("2026-09-28", "2026-09-30")).toBe(2);
    expect(diffDays("2026-09-30", "2026-09-28")).toBe(-2);
    expect(diffDays("2026-09-28", "2026-09-28")).toBe(0);
  });

  it("formatea rangos dentro del mes, entre meses y entre años", () => {
    expect(formatDateRange("2026-10-05", "2026-10-09")).toBe("5 – 9 oct 2026");
    expect(formatDateRange("2026-09-28", "2026-10-02")).toBe("28 sep – 2 oct 2026");
    expect(formatDateRange("2026-12-30", "2027-01-03")).toBe("30 dic 2026 – 3 ene 2027");
    expect(formatDateRange("2026-10-05", "2026-10-05")).toBe("5 oct 2026");
  });

  it("etiqueta las quincenas", () => {
    expect(biweekShortLabel(17, 2026)).toBe("1–15 sep");
    expect(biweekShortLabel(18, 2026)).toBe("16–30 sep");
    expect(biweekShortLabel(4, 2028)).toBe("16–29 feb");
    expect(biweekLabel(18, 2026)).toBe("16–30 sep 2026");
  });

  it("recorta las horas sin ceros sobrantes", () => {
    expect(formatHours(8)).toBe("8");
    expect(formatHours(7.5)).toBe("7.5");
    expect(formatHours(7.04)).toBe("7");
  });

  it("resume la antigüedad en sus dos unidades mayores", () => {
    expect(shortTenure("3 años 6 meses 14 días")).toBe("3 años y 6 meses");
    expect(shortTenure("5 meses 2 días")).toBe("5 meses y 2 días");
    expect(shortTenure("0 días")).toBe("0 días");
    expect(shortTenure(null)).toBeNull();
  });
});

describe("pestañas", () => {
  it("solo acepta pestañas conocidas", () => {
    expect(isPanelTabKey("hours")).toBe(true);
    expect(isPanelTabKey("data")).toBe(true);
    expect(isPanelTabKey("licenses")).toBe(true);
    expect(isPanelTabKey("disciplinary")).toBe(true);
    expect(isPanelTabKey("admin")).toBe(false);
    expect(isPanelTabKey(null)).toBe(false);
  });

  it("resuelve los enlaces antiguos del expediente único", () => {
    // `?tab=record` era todo el expediente: ahora abre la pestaña de datos.
    expect(resolvePanelTab("record")).toBe("data");
    expect(resolvePanelTab("licenses")).toBe("licenses");
    expect(resolvePanelTab("admin")).toBeNull();
    expect(resolvePanelTab(null)).toBeNull();
  });

  it("reconoce a los puestos que conducen", () => {
    expect(hasDrivingPosition({ position: "chofer" })).toBe(true);
    expect(hasDrivingPosition({ positions: ["recepcionista", "chofer_coordinador"] })).toBe(true);
    expect(hasDrivingPosition({ position: "recepcionista" })).toBe(false);
    expect(hasDrivingPosition({})).toBe(false);
  });

  it("marca la pestaña con algo que atender", () => {
    const overview = overviewOf({
      vacations: [{ id: 1, employeeId: 1, startDate: "2026-10-01", endDate: "2026-10-02", daysRequested: 2, status: "pending" }],
      licenses: [{ id: 1, employeeId: 1, licenseType: "B1", status: "vencida" }],
    });
    expect(getTabAlerts(overview)).toEqual({
      vacations: { tone: "info", hint: "solicitud en revisión" },
      licenses: { tone: "danger", hint: "licencia vencida" },
    });
    expect(getTabAlerts(null)).toEqual({});
    expect(getTabAlerts(overviewOf({ linked: false }))).toEqual({});
  });
});

describe("turnos de la semana", () => {
  const days = [
    dayOf("2026-09-28", "monday", 8, "Avenida 123"),
    dayOf("2026-09-29", "tuesday", 0, null),
    dayOf("2026-09-30", "wednesday", 10, "Aeropuerto"),
    dayOf("2026-10-04", "sunday", 0, null),
  ];
  const week = { weekNumber: 40, year: 2026, startDate: "2026-09-28", endDate: "2026-10-04", totalHours: 0, days };

  it("un día tiene turno cuando se le asignó un lugar", () => {
    expect(isAssigned(days[0])).toBe(true);
    expect(isAssigned(days[1])).toBe(false);
    expect(isAssigned(undefined)).toBe(false);
  });

  it("resume hoy, el próximo turno y las horas", () => {
    const facts = getShiftFacts(overviewOf({ week }), "2026-09-28");
    expect(facts.today?.scheduleLabel).toBe("Avenida 123");
    expect(facts.next?.date).toBe("2026-09-30");
    expect(facts.registeredWeek).toBe(18);
    expect(facts.shiftDays).toBe(2);
    expect(facts.overtimeWeek).toBe(0);
  });

  it("busca el próximo turno en la semana siguiente cuando ya no quedan en la actual", () => {
    const nextWeek = {
      weekNumber: 41,
      year: 2026,
      startDate: "2026-10-05",
      endDate: "2026-10-11",
      totalHours: 6,
      days: [dayOf("2026-10-05", "monday", 6, "Oficina Central")],
    };
    const facts = getShiftFacts(overviewOf({ week, nextWeek }), "2026-09-30");
    expect(facts.next?.scheduleLabel).toBe("Oficina Central");
    expect(facts.next?.date).toBe("2026-10-05");
  });

  it("sin turnos posteriores no hay próximo turno", () => {
    expect(getShiftFacts(overviewOf({ week }), "2026-10-04").next).toBeUndefined();
  });

  it("calcula las horas extra sobre la jornada ordinaria", () => {
    const heavy = { ...week, days: [dayOf("2026-09-28", "monday", 50, "Avenida 123")] };
    expect(getShiftFacts(overviewOf({ week: heavy }), "2026-09-28").overtimeWeek).toBe(2);
  });

  it("etiqueta hoy, mañana y ayer", () => {
    expect(relativeDayLabel("2026-09-28", "2026-09-28")).toBe("Hoy");
    expect(relativeDayLabel("2026-09-29", "2026-09-28")).toBe("Mañana");
    expect(relativeDayLabel("2026-09-27", "2026-09-28")).toBe("Ayer");
    expect(relativeDayLabel("2026-10-02", "2026-09-28")).toBe("");
  });
});

describe("tareas", () => {
  it("describe el vencimiento", () => {
    expect(describeDue(null, "2026-09-28")).toEqual({ label: "Sin fecha", tone: "default" });
    expect(describeDue("2026-09-27", "2026-09-28")).toEqual({ label: "Venció hace 1 día", tone: "danger" });
    expect(describeDue("2026-09-25", "2026-09-28")).toEqual({ label: "Venció hace 3 días", tone: "danger" });
    expect(describeDue("2026-09-28", "2026-09-28")).toEqual({ label: "Hoy", tone: "warning" });
    expect(describeDue("2026-09-29", "2026-09-28")).toEqual({ label: "Mañana", tone: "info" });
    expect(describeDue("2026-10-02", "2026-09-28")).toEqual({ label: "vie 2 oct", tone: "default" });
  });

  it("ordena por vencimiento, luego prioridad, y deja las sin fecha al final", () => {
    const sorted = sortTasks([
      taskOf({ id: 1, dueDate: null }),
      taskOf({ id: 2, dueDate: "2026-10-01", priority: 1 }),
      taskOf({ id: 3, dueDate: "2026-09-30", priority: 0 }),
      taskOf({ id: 4, dueDate: "2026-10-01", priority: 3 }),
    ]);
    expect(sorted.map((task) => task.id)).toEqual([3, 4, 2, 1]);
  });
});

describe("avisos", () => {
  const today = "2026-09-28";

  it("no genera avisos cuando todo está en orden", () => {
    expect(getAttentionItems(overviewOf(), today)).toEqual([]);
  });

  it("reúne licencias, tareas y vacaciones, primero lo más grave", () => {
    const overview = overviewOf({
      licenses: [
        { id: 1, employeeId: 1, licenseType: "B1", status: "por_vencer", daysUntilExpiry: 18 },
        { id: 2, employeeId: 1, licenseType: "C2", status: "vencida" },
        { id: 3, employeeId: 1, licenseType: "A1", status: "vigente", daysUntilExpiry: 400 },
      ],
      tasks: [
        taskOf({ id: 1, dueDate: "2026-09-27" }),
        taskOf({ id: 2, dueDate: "2026-09-28" }),
        taskOf({ id: 3, dueDate: "2026-09-20", completedAt: "2026-09-21T00:00:00Z" }),
      ],
      vacations: [
        { id: 1, employeeId: 1, startDate: "2026-10-01", endDate: "2026-10-02", daysRequested: 2, status: "pending" },
        { id: 2, employeeId: 1, startDate: "2026-08-01", endDate: "2026-08-02", daysRequested: 2, status: "approved" },
      ],
    });

    const items = getAttentionItems(overview, today);
    expect(items.map((item) => [item.tone, item.label])).toEqual([
      ["danger", "Licencia C2 vencida"],
      ["danger", "1 tarea vencida"],
      ["warning", "Licencia B1 vence en 18 días"],
      ["info", "1 tarea vence hoy"],
      ["info", "Solicitud de vacaciones en revisión"],
    ]);
    expect(items.find((item) => item.id === "tasks-overdue")?.target).toEqual({ to: "/tasks" });
    expect(items.find((item) => item.id === "vacations-pending")?.target).toEqual({ tab: "vacations" });
    expect(items.find((item) => item.id === "license-2")?.target).toEqual({ tab: "licenses" });
  });
});

describe("payments", () => {
  it("elige la boleta más reciente que no esté cancelada", () => {
    const payment = (id: number, year: number, biweekNumber: number, status: "pending" | "sent" | "cancelled") =>
      ({ id, year, biweekNumber, status }) as never;
    const latest = latestPayment([
      payment(1, 2026, 16, "sent"),
      payment(2, 2026, 18, "cancelled"),
      payment(3, 2026, 17, "pending"),
      payment(4, 2025, 24, "sent"),
    ]);
    expect((latest as { id: number }).id).toBe(3);
    expect(latestPayment([])).toBeUndefined();
  });
});
