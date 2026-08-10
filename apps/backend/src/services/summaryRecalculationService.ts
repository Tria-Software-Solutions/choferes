// Server-side summary recalculation.
//
// The weekly / biweekly / monthly summaries are derived data: they must always
// be recomputed from the hours_worked rows (source of truth). The frontend used
// to compute them client-side from a truncated snapshot of hoursWorked, which
// caused totals to drift and data to appear lost. This service recomputes them
// on the server from the full data set, keeping the DB and the UI consistent.
import { HoursWorked } from "../models/HoursWorked";
import { Schedule } from "../models/Schedule";
import { ScheduleDay } from "../models/ScheduleDay";
import { WeeklySummary } from "../models/WeeklySummary";
import { BiweeklySummary } from "../models/BiweeklySummary";
import { MonthlySummary } from "../models/MonthlySummary";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const DAY_NAME_BY_INDEX = (date: Date): string => DAY_NAMES[date.getDay()];

// Parses dates the app sends: full ISO strings ("2026-08-03T06:00:00.000Z",
// from the client) parse normally; bare calendar dates ("2026-08-03") must be
// interpreted as the LOCAL calendar day, not UTC midnight (which shifts a day
// back in negative-offset timezones).
export const parseCalendarDate = (value: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return date;
  }
  if (value.includes("T")) {
    return date;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return date;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// ISO week (Monday start) — mirrors frontend utils/dates.getWeekNumberAndYear
export const getWeekNumberAndYear = (date: Date): { year: number; weekNumber: number } => {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0);

  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));

  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));

  const weekNumber =
    Math.round((tempDate.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const year = tempDate.getFullYear();

  if (weekNumber === 1 && date.getMonth() === 0) {
    return { year: year - 1, weekNumber: 53 };
  }

  if (weekNumber === 1 && date.getMonth() === 11) {
    return { year, weekNumber: 1 };
  }

  return { year, weekNumber };
};

// Quincenas alineadas al mes calendario: 1: 1-15 ene, 2: 16-31 ene, ..., 24: 16-31 dic
export const getBiweekNumber = (date: Date): number => {
  const monthIndex = date.getMonth();
  const isSecondHalf = date.getDate() > 15;
  return monthIndex * 2 + (isSecondHalf ? 2 : 1);
};

export const getBiweeklyDates = (year: number, biweekNumber: number) => {
  const month = Math.floor((biweekNumber - 1) / 2);
  const isFirstBiweek = biweekNumber % 2 === 1;
  const startDay = isFirstBiweek ? 1 : 16;
  const startDate = new Date(year, month, startDay);
  const endDay = isFirstBiweek ? 15 : new Date(year, month + 1, 0).getDate();
  const endDate = new Date(year, month, endDay);
  return { startDate, endDate };
};

const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const weekStart = startOfDay(start);
  const weekEnd = endOfDay(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000));
  return { start: weekStart, end: weekEnd };
};

const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const start = startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
  const end = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  return { start, end };
};

// Hours a schedule contributes on a given weekday: per-day hours first
// (scheduleDays), falling back to the legacy single schedule.hours value.
const getHoursForDay = (
  schedule: (Schedule & { scheduleDays?: ScheduleDay[] }) | null | undefined,
  dayName: string,
): number => {
  if (!schedule) return 0;

  if (Array.isArray(schedule.scheduleDays) && schedule.scheduleDays.length > 0) {
    const dayEntry = schedule.scheduleDays.find((sd) => sd.day.toLowerCase() === dayName);
    if (dayEntry) return dayEntry.hours;
    return 0;
  }

  return schedule.hours || 0;
};

type HoursRow = {
  date: Date;
  employeeId?: number;
  schedule?: (Schedule & { scheduleDays?: ScheduleDay[] }) | null;
};

const hoursInRange = (rows: HoursRow[], start: Date, end: Date): HoursRow[] =>
  rows.filter((row) => {
    const t = new Date(row.date).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });

// Sequelize plucks a belongsTo association under the model name by default
// ("Schedule", capital S) unless an alias is configured — normalize it.
const toHoursRow = (plain: any): HoursRow => ({
  date: plain.date,
  employeeId: plain.employeeId,
  schedule: plain.Schedule ?? plain.schedule ?? null,
});

const loadEmployeeHours = async (
  employeeId: number,
  start?: Date,
  end?: Date,
): Promise<HoursRow[]> => {
  const where: Record<string, any> = { employeeId };
  if (start && end) {
    where.date = { $between: [start, end] };
  }

  const rows = await HoursWorked.findAll({
    where,
    include: [
      {
        model: Schedule,
        include: [{ model: ScheduleDay, as: "scheduleDays" }],
      },
    ],
  });

  return rows.map((row) => toHoursRow(row.get({ plain: true })));
};

const sumHours = (rows: HoursRow[]): number =>
  rows.reduce((total, row) => {
    const dayName = DAY_NAME_BY_INDEX(new Date(row.date));
    return total + getHoursForDay(row.schedule ?? null, dayName);
  }, 0);

type RangeSpec = {
  type: "weekly" | "biweekly" | "monthly";
  start: Date;
  end: Date;
  summary: Record<string, number>;
};

const buildRanges = (dates: Date[]): RangeSpec[] => {
  const ranges: RangeSpec[] = [];
  const seenWeekly = new Set<string>();
  const seenBiweekly = new Set<string>();
  const seenMonthly = new Set<string>();

  dates.forEach((date) => {
    const { year: isoYear, weekNumber } = getWeekNumberAndYear(date);
    const weekKey = `${isoYear}-${weekNumber}`;
    if (!seenWeekly.has(weekKey)) {
      seenWeekly.add(weekKey);
      const { start, end } = getWeekRange(date);
      ranges.push({
        type: "weekly",
        start,
        end,
        summary: { weekNumber, year: isoYear, month: date.getMonth() + 1 },
      });
    }

    const biweekNumber = getBiweekNumber(date);
    const biweekKey = `${date.getFullYear()}-${biweekNumber}`;
    if (!seenBiweekly.has(biweekKey)) {
      seenBiweekly.add(biweekKey);
      const { startDate, endDate } = getBiweeklyDates(date.getFullYear(), biweekNumber);
      ranges.push({
        type: "biweekly",
        start: startOfDay(startDate),
        end: endOfDay(endDate),
        summary: {
          biweekNumber,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
        },
      });
    }

    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!seenMonthly.has(monthKey)) {
      seenMonthly.add(monthKey);
      const { start, end } = getMonthRange(date);
      ranges.push({
        type: "monthly",
        start,
        end,
        summary: { month: date.getMonth() + 1, year: date.getFullYear() },
      });
    }
  });

  return ranges;
};

const upsertSummary = async (
  employeeId: number,
  type: "weekly" | "biweekly" | "monthly",
  summary: Record<string, number>,
  totalHours: number,
): Promise<"created" | "updated" | "deleted" | "noop"> => {
  if (totalHours <= 0) {
    if (type === "weekly") {
      await WeeklySummary.destroy({
        where: { employeeId, weekNumber: summary.weekNumber, year: summary.year },
      });
    } else if (type === "biweekly") {
      await BiweeklySummary.destroy({
        where: { employeeId, biweekNumber: summary.biweekNumber, year: summary.year },
      });
    } else {
      await MonthlySummary.destroy({
        where: { employeeId, month: summary.month, year: summary.year },
      });
    }
    return "deleted";
  }

  if (type === "weekly") {
    const existing = await WeeklySummary.findOne({
      where: { employeeId, weekNumber: summary.weekNumber, year: summary.year },
    });
    if (existing) {
      await existing.update({ ...summary, totalHours, employeeId });
      return "updated";
    }
    await WeeklySummary.create({ ...summary, totalHours, employeeId });
    return "created";
  }

  if (type === "biweekly") {
    const existing = await BiweeklySummary.findOne({
      where: { employeeId, biweekNumber: summary.biweekNumber, year: summary.year },
    });
    if (existing) {
      await existing.update({ ...summary, totalHours, employeeId });
      return "updated";
    }
    await BiweeklySummary.create({ ...summary, totalHours, employeeId });
    return "created";
  }

  const existing = await MonthlySummary.findOne({
    where: { employeeId, month: summary.month, year: summary.year },
  });
  if (existing) {
    await existing.update({ ...summary, totalHours, employeeId });
    return "updated";
  }
  await MonthlySummary.create({ ...summary, totalHours, employeeId });
  return "created";
};

const recalculateFromRows = async (
  employeeId: number,
  rows: HoursRow[],
  dates: Date[],
): Promise<{ weekly: number; biweekly: number; monthly: number }> => {
  const ranges = buildRanges(dates);
  const counts = { weekly: 0, biweekly: 0, monthly: 0 };

  const results = await Promise.all(
    ranges.map(async (range) => {
      const inRange = hoursInRange(rows, range.start, range.end);
      const total = sumHours(inRange);
      const result = await upsertSummary(employeeId, range.type, range.summary, total);
      return { type: range.type, result };
    }),
  );

  results.forEach(({ type, result }) => {
    if (result !== "noop") {
      counts[type] += 1;
    }
  });

  return counts;
};

// Recalculates the summaries for the periods covering `date` (if provided), or
// for every period present in the employee's hours worked records.
export const recalculateSummariesForEmployee = async (
  employeeId: number,
  date?: Date | string,
): Promise<{ weekly: number; biweekly: number; monthly: number }> => {
  if (date !== undefined) {
    const target = parseCalendarDate(String(date));
    if (Number.isNaN(target.getTime())) {
      throw new Error("Invalid date");
    }

    const { start: weekStart, end: weekEnd } = getWeekRange(target);
    const { startDate, endDate } = getBiweeklyDates(target.getFullYear(), getBiweekNumber(target));
    const { start: monthStart, end: monthEnd } = getMonthRange(target);

    const minStart = new Date(
      Math.min(weekStart.getTime(), startDate.getTime(), monthStart.getTime()),
    );
    const maxEnd = new Date(Math.max(weekEnd.getTime(), endDate.getTime(), monthEnd.getTime()));

    const rows = await loadEmployeeHours(employeeId, minStart, maxEnd);
    return recalculateFromRows(employeeId, rows, [target]);
  }

  const rows = await loadEmployeeHours(employeeId);
  const dates = rows.map((row) => new Date(row.date));
  return recalculateFromRows(employeeId, rows, dates);
};

// Recalculates the summaries of the current week / biweek / month for every
// employee that has hours worked in the current month. Used on login and after
// bulk operations (auto-generation) to keep the current period totals fresh.
export const recalculateCurrentPeriodsForAllEmployees = async (): Promise<{
  employees: number;
  weekly: number;
  biweekly: number;
  monthly: number;
}> => {
  const today = new Date();
  const { start, end } = getMonthRange(today);

  const rows = await HoursWorked.findAll({
    where: { date: { $between: [start, end] } },
    include: [
      {
        model: Schedule,
        include: [{ model: ScheduleDay, as: "scheduleDays" }],
      },
    ],
  });

  const byEmployee = new Map<number, HoursRow[]>();
  rows.forEach((row) => {
    const plain = toHoursRow(row.get({ plain: true }));
    const employeeId = plain.employeeId ?? -1;
    const list = byEmployee.get(employeeId) || [];
    list.push(plain);
    byEmployee.set(employeeId, list);
  });

  const employeesWithHours = Array.from(byEmployee, ([employeeId, employeeRows]) => ({
    employeeId,
    employeeRows,
  }));

  const allCounts = await Promise.all(
    employeesWithHours.map(async ({ employeeId, employeeRows }) => {
      const dates = employeeRows.map((row) => new Date(row.date));
      return recalculateFromRows(employeeId, employeeRows, dates);
    }),
  );

  return {
    employees: byEmployee.size,
    weekly: allCounts.reduce((sum, c) => sum + c.weekly, 0),
    biweekly: allCounts.reduce((sum, c) => sum + c.biweekly, 0),
    monthly: allCounts.reduce((sum, c) => sum + c.monthly, 0),
  };
};
