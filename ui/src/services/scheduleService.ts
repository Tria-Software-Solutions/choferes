import { Schedule } from "../models/Schedule";
import api from "./api";

export const getSchedules = async () => {
  const response = await api.get("/schedules");
  return response.data;
};

export const createSchedule = async (newSchedule: Omit<Schedule, "id">) => {
  const response = await api.post("/schedules", newSchedule);
  return response.data;
};

export const updateSchedule = async (
  id: number,
  updatedSchedule: Partial<Schedule>
) => {
  const response = await api.put(`/schedules/${id}`, updatedSchedule);
  return response.data;
};

export const deleteSchedule = async (id: number) => {
  const response = await api.delete(`/schedules/${id}`);
  return { id, message: response.data };
};
