import { Schedule } from '../models/Schedule';
import api from './api';

export const getSchedules = async () => {
  const response = await api.get("/schedules");
  return response.data;
};

export const createSchedule = async (newSchedule: Omit<Schedule, "id">) => {
  const response = await api.post("/schedules", newSchedule);
  return response.data;
};

export const updateSchedule = async (id: number, updatedSchedule: Partial<Schedule>) => {
  await api.put(`/schedules/${id}`, updatedSchedule);
};

export const deleteSchedule = async (id: number) => {
  await api.delete(`/schedules/${id}`);
};
