// Note: Sequelize v3 uses string operators. Using inline types instead.
import { HoursWorked } from "../models/HoursWorked";
import { Employee } from "../models/Employee";
import { Schedule } from "../models/Schedule";
import { parseCalendarDate } from "./summaryRecalculationService";
import { paginate, getPaginationParams, getSearchParam, QueryParams } from "../utils/pagination";
import { notifyEmployeeUser } from "./notificationService";

// Returns a YYYY-MM-DD string from a Date (local calendar day).
const toDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDay = (dateStr: string) => String(dateStr).split("-").reverse().join("/");

const scheduleLabelFor = async (scheduleId: number | undefined): Promise<string | null> => {
  if (!scheduleId) return null;
  const schedule = await Schedule.findByPk(scheduleId, { attributes: ["label"] });
  return schedule?.label ?? null;
};

export const getHoursWorked = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);

  // Optional inclusive date range filter (YYYY-MM-DD or ISO dates). Used by the
  // board to fetch only the visible week instead of the whole history.
  const dateFrom = query.dateFrom ? parseCalendarDate(query.dateFrom) : null;
  const dateTo = query.dateTo ? parseCalendarDate(query.dateTo) : null;

  // HoursWorked search is done via the associated Employee model
  const whereClause: Record<string, any> = {};
  if (query.employeeId) whereClause.employeeId = parseInt(query.employeeId, 10);
  if (dateFrom && !Number.isNaN(dateFrom.getTime()) && dateTo && !Number.isNaN(dateTo.getTime())) {
    whereClause.date = { $between: [toDateStr(dateFrom), toDateStr(dateTo)] };
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

export const getHoursWorkedByDate = async (date: Date) =>
  HoursWorked.findAll({
    where: { date: toDateStr(date) },
    include: [{ model: Employee }],
  });

export const getHoursWorkedByDateRange = async (startDate: Date, endDate: Date) =>
  HoursWorked.findAll({
    where: { date: { $between: [toDateStr(startDate), toDateStr(endDate)] } },
    include: [{ model: Employee }],
  });

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
  // date is DATEONLY (YYYY-MM-DD string); use exact equality — no timestamp range needed.
  const dateStr =
    typeof data.date === "string" ? data.date : toDateStr(data.date as unknown as Date);

  const findExisting = () =>
    HoursWorked.findOne({
      where: { employeeId: data.employeeId, date: dateStr },
      order: [["id", "DESC"]],
    });

  const existing = await findExisting();

  if (existing) {
    await existing.update({ scheduleId: data.scheduleId, date: dateStr });
    await existing.reload();
    return existing;
  }

  try {
    const newHoursWorked = await HoursWorked.create({ ...data, date: dateStr });
    await newHoursWorked.reload();

    const label = await scheduleLabelFor(data.scheduleId as number | undefined);
    await notifyEmployeeUser(data.employeeId, {
      source: `schedule-assigned:${data.employeeId}:${dateStr}`,
      title: "Tu turno fue publicado",
      message: `Se te asignó el turno ${label ?? "de la semana"} para el ${formatDay(dateStr)}.`,
      type: "info",
      category: "schedule",
      priority: "medium",
      actionUrl: "/dashboard",
      actionText: "Ver mi panel",
    });

    return newHoursWorked;
  } catch (error) {
    // Concurrent creates for the same employee+day: the unique index rejected
    // this one — update the record that won the race instead of erroring.
    if (isUniqueConstraintError(error)) {
      const winner = await findExisting();
      if (winner) {
        await winner.update({ scheduleId: data.scheduleId, date: dateStr });
        await winner.reload();
        return winner;
      }
    }
    throw error;
  }
};

export const updateHoursWorked = async (id: number, data: Omit<HoursWorked, "id">) => {
  const previous = await HoursWorked.findByPk(id);
  await HoursWorked.update(data, { where: { id } });
  const updated = await HoursWorked.findByPk(id);

  if (
    previous &&
    updated &&
    (previous.scheduleId !== updated.scheduleId || previous.date !== updated.date)
  ) {
    const label = await scheduleLabelFor(updated.scheduleId as number | undefined);
    await notifyEmployeeUser(updated.employeeId, {
      source: `schedule-assignment-updated:${id}:${Date.now()}`,
      title: "Tu turno cambió",
      message: `Se actualizó tu turno para el ${formatDay(updated.date)} (${label ?? "turno"}). Revisa tu panel.`,
      type: "warning",
      category: "schedule",
      priority: "medium",
      actionUrl: "/dashboard",
      actionText: "Ver mi panel",
    });
  }

  return updated;
};

export const deleteHoursWorked = async (id: number) => {
  const row = await HoursWorked.findByPk(id);
  if (!row) return 0;
  await HoursWorked.destroy({ where: { id } });
  await notifyEmployeeUser(row.employeeId, {
    source: `schedule-assignment-removed:${id}`,
    title: "Te quitaron un turno",
    message: `Se retiró tu turno del ${formatDay(row.date)}.`,
    type: "warning",
    category: "schedule",
    priority: "high",
    actionUrl: "/dashboard",
    actionText: "Ver mi panel",
  });
  return 1;
};

// Delete all hours worked records
export const deleteAllHoursWorked = async () => HoursWorked.destroy({ where: {} });
