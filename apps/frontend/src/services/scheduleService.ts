import { Schedule } from "../models/Schedule";
import api, { invalidateCache } from "./api";

export const getSchedules = async (search?: string) => {
  const params: Record<string, string | number> = {
    _t: Date.now(),
  };
  if (search) params.search = search;

  const response = await api.get("/schedules", { params });
  // Normalize: ensure scheduleDays is always an array
  const data = response.data.data;
  if (Array.isArray(data)) {
    return data.map(normalizeSchedule);
  }
  return data;
};

// Helper to ensure scheduleDays is always present as an array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSchedule(schedule: any) {
  if (!schedule.scheduleDays) {
    schedule.scheduleDays = [];
  }
  return schedule;
}



export const getScheduleById = async (id: number) => {
  const response = await api.get(`/schedules/${id}`);
  const schedule = response.data;
  if (!schedule.scheduleDays) {
    schedule.scheduleDays = [];
  }
  return schedule;
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
