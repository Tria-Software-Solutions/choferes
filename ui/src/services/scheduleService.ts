import { Schedule } from "../models/Schedule";
import api, { invalidateCache } from "./api";

export const getSchedules = async () => {
  const response = await api.get("/schedules", {
    params: {
      _t: Date.now()
    }
  });
  return response.data;
};

export const getScheduleById = async (id: number) => {
  const response = await api.get(`/schedules/${id}`);
  return response.data;
};

export const createSchedule = async (newSchedule: Omit<Schedule, "id">) => {
  const response = await api.post("/schedules", newSchedule);
  invalidateCache("/schedules");
  return response.data;
};

export const updateSchedule = async (
  id: number,
  updatedSchedule: Partial<Schedule>,
) => {
  const response = await api.put(`/schedules/${id}`, updatedSchedule);
  invalidateCache("/schedules");
  return response.data;
};

export const deleteSchedule = async (id: number) => {
  const response = await api.delete(`/schedules/${id}`);
  invalidateCache("/schedules");
  return { id, message: response.data };
};
