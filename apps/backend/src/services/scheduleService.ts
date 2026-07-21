// Service for business logic and database operations related to schedules
// Note: Sequelize v3 doesn't export FindAndCountOptions
// Using inline Record<string, any> instead
import { Schedule } from "../models/Schedule";
import {
  paginate,
  getPaginationParams,
  getSearchParam,
  buildSearchWhere,
  QueryParams,
} from "../utils/pagination";

// Get all schedules (paginated, searchable)
export const getSchedules = async (query: QueryParams) => {
  const params = getPaginationParams(query);
  const search = getSearchParam(query);
  const searchWhere = buildSearchWhere(search, ["label"]);

  const options: Record<string, any> = {
    where: searchWhere,
    order: [["label", "ASC"]],
  };
  return paginate<Schedule>(Schedule, options, params);
};

// Get a schedule by its ID
export const getScheduleById = async (id: number) => Schedule.findByPk(id);

// Create a new schedule
export const createSchedule = async (data: Omit<Schedule, "id">) => {
  const newSchedule = await Schedule.create(data);
  await newSchedule.reload();
  return newSchedule;
};

// Update a schedule by its ID
export const updateSchedule = async (id: number, data: Omit<Schedule, "id">) => {
  await Schedule.update(data, { where: { id } });
  return Schedule.findByPk(id);
};

// Delete a schedule by its ID
export const deleteSchedule = async (id: number) => Schedule.destroy({ where: { id } });
