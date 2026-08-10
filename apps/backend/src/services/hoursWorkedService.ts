// Note: Sequelize v3 uses string operators. Using inline types instead.
import { HoursWorked } from "../models/HoursWorked";
import { Employee } from "../models/Employee";
import { parseCalendarDate } from "./summaryRecalculationService";
import { paginate, getPaginationParams, getSearchParam, QueryParams } from "../utils/pagination";

export const getHoursWorked = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);

  // Optional inclusive date range filter (YYYY-MM-DD or ISO dates). Used by the
  // board to fetch only the visible week instead of the whole history.
  const dateFrom = query.dateFrom ? parseCalendarDate(query.dateFrom) : null;
  const dateTo = query.dateTo ? parseCalendarDate(query.dateTo) : null;

  // HoursWorked search is done via the associated Employee model
  const whereClause: Record<string, any> = {};
  if (dateFrom && !Number.isNaN(dateFrom.getTime()) && dateTo && !Number.isNaN(dateTo.getTime())) {
    const start = new Date(dateFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    whereClause.date = { $between: [start, end] };
  }
  const includeWhere: Record<string, any> | undefined = search
    ? {
        $or: [{ firstName: { $iLike: `%${search}%` } }, { lastName: { $iLike: `%${search}%` } }],
      }
    : undefined;

  const options: Record<string, any> = {
    where: whereClause,
    include: [
      {
        model: Employee,
        where: includeWhere,
      },
    ],
    order: [["date", "DESC"]],
  };
  return paginate<HoursWorked>(HoursWorked, options, params);
};

export const getHoursWorkedById = async (id: number) =>
  HoursWorked.findByPk(id, {
    include: [
      {
        model: Employee,
      },
    ],
  });

export const getHoursWorkedByEmployee = async (employeeId: number) =>
  HoursWorked.findAll({
    where: { employeeId },
    include: [
      {
        model: Employee,
      },
    ],
  });

export const getHoursWorkedByDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return HoursWorked.findAll({
    where: {
      date: {
        $between: [startOfDay, endOfDay],
      },
    },
    include: [
      {
        model: Employee,
      },
    ],
  });
};

export const getHoursWorkedByDateRange = async (startDate: Date, endDate: Date) =>
  HoursWorked.findAll({
    where: {
      date: {
        $between: [startDate, endDate],
      },
    },
    include: [
      {
        model: Employee,
      },
    ],
  });

// Returns the inclusive day range covering the calendar day of `date` (server-local).
const getDayRange = (date: Date): { dayStart: Date; dayEnd: Date } => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
};

const isUniqueConstraintError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  (error as { name?: string }).name === "SequelizeUniqueConstraintError";

// The app expects ONE record per employee per calendar day (enforced by the
// unique index hours_worked_employeeId_date_unique). The client may try to
// create a record for a day that already has one (stale Redux state after a
// race), so instead of failing we update the existing record — this keeps the
// DB constraint and the UI in sync.
export const createHoursWorked = async (data: Omit<HoursWorked, "id">) => {
  const { dayStart, dayEnd } = getDayRange(new Date(data.date));

  const findExisting = () =>
    HoursWorked.findOne({
      where: {
        employeeId: data.employeeId,
        date: { $between: [dayStart, dayEnd] },
      },
      order: [["id", "DESC"]],
    });

  const existing = await findExisting();

  if (existing) {
    await existing.update({ scheduleId: data.scheduleId, date: data.date });
    await existing.reload();
    return existing;
  }

  try {
    const newHoursWorked = await HoursWorked.create(data);
    await newHoursWorked.reload();
    return newHoursWorked;
  } catch (error) {
    // Concurrent creates for the same employee+day: the unique index rejected
    // this one — update the record that won the race instead of erroring.
    if (isUniqueConstraintError(error)) {
      const winner = await findExisting();
      if (winner) {
        await winner.update({ scheduleId: data.scheduleId, date: data.date });
        await winner.reload();
        return winner;
      }
    }
    throw error;
  }
};

export const updateHoursWorked = async (id: number, data: Omit<HoursWorked, "id">) => {
  await HoursWorked.update(data, { where: { id } });
  return HoursWorked.findByPk(id);
};

export const deleteHoursWorked = async (id: number) => HoursWorked.destroy({ where: { id } });

// Delete all hours worked records
export const deleteAllHoursWorked = async () => HoursWorked.destroy({ where: {} });
