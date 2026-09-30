// Autoservicio del empleado vinculado al usuario autenticado ("Mi Panel").
//
// Toda consulta se deriva de `users.employeeId`, nunca de un id que envíe el
// cliente, así que un usuario solo puede leer (y solicitar) información propia.
// Los endpoints dedicados de vacaciones/amonestaciones/licencias siguen
// protegidos por permisos administrativos; este servicio es la vía self-service.
import { User } from "../models/User";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";
import { ScheduleDay } from "../models/ScheduleDay";
import { WeeklySummary } from "../models/WeeklySummary";
import { BiweeklySummary } from "../models/BiweeklySummary";
import { MonthlySummary } from "../models/MonthlySummary";
import { HoursWorked } from "../models/HoursWorked";
import { ServiceError } from "../utils/errors";
import {
  getBiweekNumber,
  getBiweeklyDates,
  getWeekNumberAndYear,
  startOfDay,
} from "./summaryRecalculationService";
import * as vacationService from "./vacationService";
import * as notificationService from "./notificationService";
import * as vacationAccrualService from "./vacationAccrualService";
import * as disciplinaryService from "./disciplinaryActionService";
import * as licenseService from "./employeeLicenseService";
import * as paymentService from "./paymentService";
import * as taskService from "./taskService";

// Weekday order used to render the weekly schedule (matches schedule_day.day).
const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const pad = (value: number): string => String(value).padStart(2, "0");

// Local calendar date (YYYY-MM-DD) of a Date, without timezone drift.
const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Monday→Sunday range of the week that contains `reference`.
const getWeekRange = (reference: Date): { start: Date; end: Date } => {
  const start = startOfDay(reference);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Hours a schedule contributes on a given weekday (per-day rows first,
// falling back to the legacy single `hours` column).
const hoursForDay = (schedule: Schedule | null, dayName: string): number => {
  if (!schedule) return 0;
  const days = (schedule as Schedule & { scheduleDays?: ScheduleDay[] }).scheduleDays;
  if (Array.isArray(days) && days.length > 0) {
    const entry = days.find((item) => item.day?.toLowerCase() === dayName);
    return entry ? Number(entry.hours) : 0;
  }
  return Number(schedule.hours) || 0;
};

// Sequelize 4 typings do not declare instance methods on the model class, so
// rows are cast before calling get({ plain: true }).
type PlainRow = { get: (options: { plain: true }) => Record<string, unknown> };
const toPlain = (row: unknown) => (row as PlainRow).get({ plain: true });

/** Resolves the employee linked to the user (users.employeeId), or null. */
export const getLinkedEmployee = async (userId: number): Promise<Employee | null> => {
  const user = await User.findByPk(userId, { attributes: ["id", "employeeId"] });
  if (!user || !user.employeeId) return null;
  return Employee.findByPk(user.employeeId);
};

/** Un día de la semana con el Horario/Lugar que la persona tiene asignado. */
export interface MyPanelDay {
  date: string;
  day: string;
  /** Horas del turno asignado ese día (0 si no hay asignación). */
  hours: number;
  scheduleId: number | null;
  /** Horario/Lugar asignado ("Avenida 123"…); null cuando no hay asignación. */
  scheduleLabel: string | null;
}

export interface MyPanelWeek {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  /** Horas asignadas en la semana (suma de los días). */
  totalHours: number;
  /** Lunes→domingo. */
  days: MyPanelDay[];
}

export interface MyPanelOverview {
  linked: boolean;
  employee?: Record<string, unknown>;
  /** Semana en curso. */
  week?: MyPanelWeek;
  /** Semana siguiente: la programación suele publicarse con anticipación. */
  nextWeek?: MyPanelWeek;
  /** Últimas semanas cerradas del empleado (ascendente), para la gráfica. */
  history: {
    weekly: { weekNumber: number; year: number; totalHours: number }[];
  };
  vacationAccrual?: Awaited<ReturnType<typeof vacationAccrualService.getVacationAccrual>> | null;
  vacations: unknown[];
  disciplinaryActions: unknown[];
  licenses: unknown[];
  payments: unknown[];
  tasks: unknown[];
  summaries: {
    weekly: { weekNumber: number; year: number; totalHours: number } | null;
    biweekly: {
      biweekNumber: number;
      year: number;
      totalHours: number;
      startDate: string;
      endDate: string;
    } | null;
    monthly: { month: number; year: number; totalHours: number } | null;
  };
}

// Empty-but-shaped response for users without a linked employee, so the client
// can render a clear empty state without special-casing the payload.
const emptyOverview = (): MyPanelOverview => ({
  linked: false,
  vacations: [],
  disciplinaryActions: [],
  licenses: [],
  payments: [],
  tasks: [],
  summaries: { weekly: null, biweekly: null, monthly: null },
  history: { weekly: [] },
});

type AssignmentRow = { date: unknown; scheduleId: unknown };

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// Monday→Sunday of the week starting on `start`, with the schedule (place)
// assigned each day. The Roles board stores at most one assignment per
// employee and date; if there were several, the last one wins.
const buildWeek = (
  start: Date,
  assignments: AssignmentRow[],
  scheduleById: Map<number, Schedule>,
): MyPanelWeek => {
  const days: MyPanelDay[] = WEEK_DAYS.map((_, index) => {
    const current = addDays(start, index);
    const date = toDateString(current);
    const dayName = WEEK_DAYS[(current.getDay() + 6) % 7];
    const forDay = assignments.filter((row) => String(row.date).slice(0, 10) === date);
    const row = forDay[forDay.length - 1];
    const schedule = row ? scheduleById.get(Number(row.scheduleId)) : undefined;
    return {
      date,
      day: dayName,
      hours: schedule ? hoursForDay(schedule, dayName) : 0,
      scheduleId: schedule ? schedule.id : null,
      scheduleLabel: schedule ? schedule.label : null,
    };
  });

  const { year, weekNumber } = getWeekNumberAndYear(start);
  return {
    weekNumber,
    year,
    startDate: days[0].date,
    endDate: days[6].date,
    totalHours: days.reduce((total, day) => total + day.hours, 0),
    days,
  };
};

/** Everything the personal panel shows, scoped to the linked employee. */
export const getMyOverview = async (userId: number): Promise<MyPanelOverview> => {
  const employee = await getLinkedEmployee(userId);
  if (!employee) return emptyOverview();

  const now = new Date();
  const { year: weekYear, weekNumber } = getWeekNumberAndYear(now);
  const biweekNumber = getBiweekNumber(now);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { start: weekStart } = getWeekRange(now);
  const nextWeekStart = addDays(weekStart, 7);
  const { end: nextWeekEnd } = getWeekRange(nextWeekStart);
  const biweeklyRange = getBiweeklyDates(year, biweekNumber);

  const [
    vacationsResult,
    vacationAccrual,
    disciplinaryResult,
    licenses,
    paymentsResult,
    tasks,
    weekly,
    biweekly,
    monthly,
    assignments,
  ] = await Promise.all([
    vacationService.getVacations({ employeeId: String(employee.id), limit: "50" }),
    vacationAccrualService.getVacationAccrual(employee.id).catch(() => null),
    disciplinaryService.getDisciplinaryActions({ employeeId: String(employee.id), limit: "50" }),
    licenseService.getLicensesByEmployee(employee.id),
    paymentService.getPayments({ employeeId: String(employee.id), limit: "24" }),
    taskService.getTasks(userId),
    WeeklySummary.findOne({ where: { employeeId: employee.id, weekNumber, year: weekYear } }),
    BiweeklySummary.findOne({ where: { employeeId: employee.id, biweekNumber, year } }),
    MonthlySummary.findOne({ where: { employeeId: employee.id, month, year } }),
    // This week and the next one: the Roles board allows assigning ahead of time.
    HoursWorked.findAll({
      where: {
        employeeId: employee.id,
        date: { $gte: toDateString(weekStart), $lte: toDateString(nextWeekEnd) },
      },
    }),
  ]);

  // The place (Horario/Lugar) of each day comes from the schedule assigned on
  // the Roles board, which is what the employee needs to know.
  const scheduleIds = Array.from(
    new Set(
      assignments
        .map((row) => Number(row.scheduleId))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );
  const schedules = scheduleIds.length
    ? await Schedule.findAll({
        where: { id: scheduleIds },
        include: [{ model: ScheduleDay, as: "scheduleDays", attributes: ["id", "day", "hours"] }],
      })
    : [];
  const scheduleById = new Map<number, Schedule>(schedules.map((item) => [item.id, item]));

  const currentWeek = buildWeek(weekStart, assignments, scheduleById);
  const upcomingWeek = buildWeek(nextWeekStart, assignments, scheduleById);

  // Last closed weeks (ascending) so the panel can show the trend without
  // pulling the whole history from the client.
  const weeklyHistoryRows = await WeeklySummary.findAll({
    where: { employeeId: employee.id },
    order: [
      ["year", "DESC"],
      ["weekNumber", "DESC"],
    ],
    limit: 8,
  });
  const weeklyHistory = weeklyHistoryRows
    .map((row) => ({
      weekNumber: Number(row.weekNumber),
      year: Number(row.year),
      totalHours: Number(row.totalHours) || 0,
    }))
    .reverse();

  return {
    linked: true,
    employee: toPlain(employee),
    week: currentWeek,
    nextWeek: upcomingWeek,
    history: { weekly: weeklyHistory },
    vacationAccrual,
    vacations: vacationsResult.data,
    disciplinaryActions: disciplinaryResult.data,
    licenses,
    payments: paymentsResult.data,
    tasks,
    summaries: {
      weekly: weekly
        ? { weekNumber, year: weekYear, totalHours: Number(weekly.totalHours) || 0 }
        : null,
      biweekly: biweekly
        ? {
            biweekNumber,
            year,
            totalHours: Number(biweekly.totalHours) || 0,
            startDate: toDateString(biweeklyRange.startDate),
            endDate: toDateString(biweeklyRange.endDate),
          }
        : null,
      monthly: monthly ? { month, year, totalHours: Number(monthly.totalHours) || 0 } : null,
    },
  };
};

export interface MyVacationInput {
  startDate: string;
  endDate: string;
  reason?: string | null;
}

/** Creates a pending vacation request for the signed-in employee. */
export const createMyVacation = async (userId: number, input: MyVacationInput) => {
  const employee = await getLinkedEmployee(userId);
  if (!employee) {
    throw new ServiceError(
      400,
      "Tu cuenta no está vinculada a un empleado de Planilla, así que no puedes solicitar vacaciones.",
    );
  }

  const created = await vacationService.createVacation({
    employeeId: employee.id,
    startDate: input.startDate,
    endDate: input.endDate,
    reason: input.reason ?? null,
  });

  const employeeName =
    `${employee.firstName} ${employee.lastName}`.trim() || `el empleado #${employee.id}`;
  await notificationService.notifyManagementRoles({
    source: `vacation-request:${created.id}`,
    title: "Solicitud de vacaciones",
    message: `${employeeName} solicitó ${created.daysRequested} día(s) de vacaciones (del ${input.startDate} al ${input.endDate}).`,
    type: "info",
    category: "employee",
    priority: "medium",
    actionUrl: "/dashboard",
    actionText: "Ver solicitudes",
  });

  return created;
};
