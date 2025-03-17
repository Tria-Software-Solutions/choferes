import { Schedule } from "../models/Schedule";

export const getSchedules = async () => {
  return Schedule.findAll();
};

export const getScheduleById = async (id: number) => {
  return Schedule.findByPk(id);
};

export const createSchedule = async (data: Omit<Schedule, "id">) => {
  const newSchedule = await Schedule.create(data);
  await newSchedule.reload();
  return newSchedule;
};

export const updateSchedule = async (
  id: number,
  data: Omit<Schedule, "id">
) => {
  await Schedule.update(data, { where: { id } });
  return Schedule.findByPk(id);
};

export const deleteSchedule = async (id: number) => {
  return Schedule.destroy({ where: { id } });
};
