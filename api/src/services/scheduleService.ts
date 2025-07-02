// Service for business logic and database operations related to schedules
import { Schedule } from "../models/Schedule";

// Get all schedules
export const getSchedules = async () => Schedule.findAll();

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
