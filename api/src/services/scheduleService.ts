import { Schedule } from "../models/Schedule";

export const createSchedule = async (data: Omit<Schedule, "id">) => {
  return Schedule.create(data);
};

export const getAllSchedules = async () => {
  return Schedule.findAll();
};

export const getScheduleById = async (id: number) => {
  return Schedule.findByPk(id);
};

export const updateSchedule = async (
  id: number,
  data: { day?: string; label?: string; hours?: number }
) => {
  await Schedule.update(data, { where: { id } });
  return Schedule.findByPk(id);
};

export const deleteSchedule = async (id: number) => {
  return Schedule.destroy({ where: { id } });
};
