// Service for business logic and database operations related to schedules
// Note: Sequelize v3 doesn't export FindAndCountOptions
// Using inline Record<string, any> instead
import { Schedule } from "../models/Schedule";
import { ScheduleDay } from "../models/ScheduleDay";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

const SCHEDULE_DAYS_INCLUDE = {
  model: ScheduleDay,
  as: "scheduleDays",
  attributes: ["id", "day", "hours"],
};

// Get all schedules (paginated, searchable)
export const getSchedules = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, ["label"]);

  const options: Record<string, any> = {
    where: searchWhere,
    order: [["label", "ASC"]],
    include: [SCHEDULE_DAYS_INCLUDE],
  };
  return paginate<Schedule>(Schedule, options, params);
};

// Get a schedule by its ID
export const getScheduleById = async (id: number) =>
  Schedule.findByPk(id, { include: [SCHEDULE_DAYS_INCLUDE] });

// Create a new schedule with optional scheduleDays
export const createSchedule = async (data: any) => {
  const { scheduleDays, ...scheduleData } = data;
  const newSchedule = await Schedule.create(scheduleData);

  if (scheduleDays && Array.isArray(scheduleDays) && scheduleDays.length > 0) {
    await ScheduleDay.bulkCreate(
      scheduleDays.map((sd: { day: string; hours: number }) => ({
        scheduleId: newSchedule.id,
        day: sd.day,
        hours: sd.hours,
      })),
    );
  }

  await newSchedule.reload({ include: [SCHEDULE_DAYS_INCLUDE] });
  return newSchedule;
};

// Update a schedule by its ID
export const updateSchedule = async (id: number, data: any) => {
  const { scheduleDays, ...scheduleData } = data;

  await Schedule.update(scheduleData, { where: { id } });

  if (scheduleDays && Array.isArray(scheduleDays)) {
    // Delete existing scheduleDays and re-create
    await ScheduleDay.destroy({ where: { scheduleId: id } });

    if (scheduleDays.length > 0) {
      await ScheduleDay.bulkCreate(
        scheduleDays.map((sd: { day: string; hours: number }) => ({
          scheduleId: id,
          day: sd.day,
          hours: sd.hours,
        })),
      );
    }
  }

  return Schedule.findByPk(id, { include: [SCHEDULE_DAYS_INCLUDE] });
};

// Delete a schedule by its ID
export const deleteSchedule = async (id: number) => Schedule.destroy({ where: { id } });

// Helper: get hours for a specific day from a schedule's scheduleDays
export const getHoursForDay = (schedule: any, day: string): number => {
  if (!schedule) return 0;
  const scheduleDay = schedule.scheduleDays?.find((sd: any) => sd.day === day);
  return scheduleDay?.hours ?? schedule.hours ?? 0;
};
