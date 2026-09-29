jest.mock("../models/User", () => ({ User: { findByPk: jest.fn() } }));
jest.mock("../models/Employee", () => ({ Employee: { findByPk: jest.fn() } }));
jest.mock("../models/Schedule", () => ({
  Schedule: { findByPk: jest.fn(), findAll: jest.fn() },
}));
jest.mock("../models/ScheduleDay", () => ({ ScheduleDay: {} }));
jest.mock("../models/WeeklySummary", () => ({
  WeeklySummary: { findOne: jest.fn(), findAll: jest.fn() },
}));
jest.mock("../models/BiweeklySummary", () => ({ BiweeklySummary: { findOne: jest.fn() } }));
jest.mock("../models/MonthlySummary", () => ({ MonthlySummary: { findOne: jest.fn() } }));
jest.mock("../models/HoursWorked", () => ({ HoursWorked: { findAll: jest.fn() } }));
jest.mock("../services/vacationService", () => ({ getVacations: jest.fn() }));
jest.mock("../services/vacationAccrualService", () => ({ getVacationAccrual: jest.fn() }));
jest.mock("../services/disciplinaryActionService", () => ({
  getDisciplinaryActions: jest.fn(),
}));
jest.mock("../services/employeeLicenseService", () => ({ getLicensesByEmployee: jest.fn() }));
jest.mock("../services/paymentService", () => ({ getPayments: jest.fn() }));
jest.mock("../services/taskService", () => ({ getTasks: jest.fn() }));

import { User } from "../models/User";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";
import { WeeklySummary } from "../models/WeeklySummary";
import { BiweeklySummary } from "../models/BiweeklySummary";
import { MonthlySummary } from "../models/MonthlySummary";
import { HoursWorked } from "../models/HoursWorked";
import * as vacationService from "../services/vacationService";
import * as vacationAccrualService from "../services/vacationAccrualService";
import * as disciplinaryService from "../services/disciplinaryActionService";
import * as licenseService from "../services/employeeLicenseService";
import * as paymentService from "../services/paymentService";
import * as taskService from "../services/taskService";
import { getMyOverview, createMyVacation } from "../services/meService";

const UserMock = User as unknown as Record<string, jest.Mock>;
const EmployeeMock = Employee as unknown as Record<string, jest.Mock>;
const ScheduleMock = Schedule as unknown as Record<string, jest.Mock>;
const WeeklySummaryMock = WeeklySummary as unknown as Record<string, jest.Mock>;
const BiweeklySummaryMock = BiweeklySummary as unknown as Record<string, jest.Mock>;
const MonthlySummaryMock = MonthlySummary as unknown as Record<string, jest.Mock>;
const HoursWorkedMock = HoursWorked as unknown as Record<string, jest.Mock>;
const vacationServiceMock = vacationService as unknown as Record<string, jest.Mock>;
const vacationAccrualMock = vacationAccrualService as unknown as Record<string, jest.Mock>;
const disciplinaryServiceMock = disciplinaryService as unknown as Record<string, jest.Mock>;
const licenseServiceMock = licenseService as unknown as Record<string, jest.Mock>;
const paymentServiceMock = paymentService as unknown as Record<string, jest.Mock>;
const taskServiceMock = taskService as unknown as Record<string, jest.Mock>;

const pad = (value: number): string => String(value).padStart(2, "0");
const iso = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Lunes de la semana en curso (misma regla que el servicio), para que el test
// no dependa de la fecha en que se ejecuta.
const weekStart = (): Date => {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// Horario/Lugar: el nombre del horario es el lugar donde se trabaja.
const avenidaSchedule = {
  id: 3,
  label: "Avenida 123",
  hours: 40,
  scheduleDays: ["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => ({
    day,
    hours: 8,
  })),
};

const airportSchedule = {
  id: 9,
  label: "Aeropuerto",
  hours: 6,
  scheduleDays: [{ day: "wednesday", hours: 6 }],
};

const employeeRow = (overrides: Record<string, unknown> = {}) => {
  const state: Record<string, unknown> = {
    id: 7,
    firstName: "Ana",
    lastName: "Rojas",
    vacationDays: 5,
    ...overrides,
  };
  return { ...state, get: jest.fn(() => ({ ...state })) };
};

const setupLinkedEmployee = () => {
  UserMock.findByPk.mockResolvedValue({ id: 1, employeeId: 7 });
  EmployeeMock.findByPk.mockResolvedValue(employeeRow());
  vacationServiceMock.getVacations.mockResolvedValue({ data: [] });
  vacationAccrualMock.getVacationAccrual.mockResolvedValue(null);
  disciplinaryServiceMock.getDisciplinaryActions.mockResolvedValue({ data: [] });
  licenseServiceMock.getLicensesByEmployee.mockResolvedValue([]);
  paymentServiceMock.getPayments.mockResolvedValue({ data: [] });
  taskServiceMock.getTasks.mockResolvedValue([]);
  MonthlySummaryMock.findOne.mockResolvedValue(null);
  BiweeklySummaryMock.findOne.mockResolvedValue(null);
  WeeklySummaryMock.findOne.mockResolvedValue(null);
  WeeklySummaryMock.findAll.mockResolvedValue([]);
  ScheduleMock.findAll.mockResolvedValue([]);
  HoursWorkedMock.findAll.mockResolvedValue([]);
};

beforeEach(() => jest.clearAllMocks());

describe("getMyOverview", () => {
  it("devuelve un panel vacío cuando la cuenta no está vinculada a un empleado", async () => {
    UserMock.findByPk.mockResolvedValue({ id: 1, employeeId: null });

    const overview = await getMyOverview(1);

    expect(overview.linked).toBe(false);
    expect(overview.employee).toBeUndefined();
    expect(overview.history).toEqual({ weekly: [] });
    expect(EmployeeMock.findByPk).not.toHaveBeenCalled();
  });

  it("desglosa la semana de lunes a domingo con el lugar y las horas asignados cada día", async () => {
    setupLinkedEmployee();
    const monday = weekStart();
    HoursWorkedMock.findAll.mockResolvedValue([
      { date: iso(monday), scheduleId: 3 },
      { date: iso(addDays(monday, 2)), scheduleId: 9 },
    ]);
    ScheduleMock.findAll.mockResolvedValue([avenidaSchedule, airportSchedule]);

    const overview = await getMyOverview(1);
    const days = overview.week?.days ?? [];

    expect(days).toHaveLength(7);
    expect(days.map((day) => day.day)).toEqual([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]);
    expect(days[0].date).toBe(iso(monday));
    expect(days[6].date).toBe(iso(addDays(monday, 6)));

    // Lunes: asignado a "Avenida 123" (8 h ese día de la semana).
    expect(days[0]).toMatchObject({ hours: 8, scheduleId: 3, scheduleLabel: "Avenida 123" });
    // Martes sin asignación: sin lugar ni horas.
    expect(days[1]).toMatchObject({ hours: 0, scheduleId: null, scheduleLabel: null });
    // Miércoles: otro lugar, con sus propias horas ese día.
    expect(days[2]).toMatchObject({ hours: 6, scheduleId: 9, scheduleLabel: "Aeropuerto" });
    expect(overview.week?.totalHours).toBe(14);
    expect(overview.week?.startDate).toBe(iso(monday));
    expect(overview.week?.endDate).toBe(iso(addDays(monday, 6)));
  });

  it("incluye la semana siguiente con sus asignaciones", async () => {
    setupLinkedEmployee();
    const nextMonday = addDays(weekStart(), 7);
    HoursWorkedMock.findAll.mockResolvedValue([{ date: iso(nextMonday), scheduleId: 9 }]);
    ScheduleMock.findAll.mockResolvedValue([
      { ...airportSchedule, scheduleDays: [{ day: "monday", hours: 5 }] },
    ]);

    const overview = await getMyOverview(1);

    expect(overview.nextWeek?.startDate).toBe(iso(nextMonday));
    expect(overview.nextWeek?.endDate).toBe(iso(addDays(nextMonday, 6)));
    expect(overview.nextWeek?.days[0]).toMatchObject({
      hours: 5,
      scheduleLabel: "Aeropuerto",
    });
    expect(overview.nextWeek?.totalHours).toBe(5);
    // La semana en curso no recibe las asignaciones de la siguiente.
    expect(overview.week?.totalHours).toBe(0);
  });

  it("consulta las asignaciones de esta semana y la siguiente en una sola búsqueda", async () => {
    setupLinkedEmployee();
    const monday = weekStart();

    await getMyOverview(1);

    expect(HoursWorkedMock.findAll).toHaveBeenCalledTimes(1);
    expect(HoursWorkedMock.findAll.mock.calls[0][0].where.date).toEqual({
      $gte: iso(monday),
      $lte: iso(addDays(monday, 13)),
    });
  });

  it("no consulta horarios cuando no hay asignaciones", async () => {
    setupLinkedEmployee();

    await getMyOverview(1);

    expect(ScheduleMock.findAll).not.toHaveBeenCalled();
  });

  it("si una asignación repetida existiera, gana la última", async () => {
    setupLinkedEmployee();
    const monday = weekStart();
    HoursWorkedMock.findAll.mockResolvedValue([
      { date: iso(monday), scheduleId: 3 },
      { date: iso(monday), scheduleId: 9 },
    ]);
    ScheduleMock.findAll.mockResolvedValue([
      avenidaSchedule,
      { ...airportSchedule, scheduleDays: [{ day: "monday", hours: 4 }] },
    ]);

    const overview = await getMyOverview(1);

    expect(overview.week?.days[0]).toMatchObject({ scheduleLabel: "Aeropuerto", hours: 4 });
  });

  it("devuelve el histórico semanal en orden ascendente", async () => {
    setupLinkedEmployee();
    WeeklySummaryMock.findAll.mockResolvedValue([
      { weekNumber: 40, year: 2026, totalHours: 24 },
      { weekNumber: 39, year: 2026, totalHours: 12 },
      { weekNumber: 38, year: 2026, totalHours: 48 },
    ]);

    const overview = await getMyOverview(1);

    expect(overview.history.weekly).toEqual([
      { weekNumber: 38, year: 2026, totalHours: 48 },
      { weekNumber: 39, year: 2026, totalHours: 12 },
      { weekNumber: 40, year: 2026, totalHours: 24 },
    ]);
  });
});

describe("createMyVacation", () => {
  it("rechaza la solicitud cuando la cuenta no está vinculada a un empleado", async () => {
    UserMock.findByPk.mockResolvedValue({ id: 1, employeeId: null });

    await expect(
      createMyVacation(1, { startDate: "2026-10-05", endDate: "2026-10-09" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
