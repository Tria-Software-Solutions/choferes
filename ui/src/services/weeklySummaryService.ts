import { WeeklySummary } from "../models/WeeklySummary";
import api, { invalidateCache } from "./api";

export const getWeeklySummaries = async () => {
  const response = await api.get("/weekly-summary", {
    params: {
      _t: Date.now()
    }
  });
  return response.data;
};

export const getCurrentWeeklySummary = async (
  employeeId: number,
  weekNumber: number,
  month: number,
  year: number,
) => {
  const response = await api.get(`/weekly-summary/employee/${employeeId}`, {
    params: { weekNumber, month, year },
  });
  return response.data;
};

export const hasWorkedCurrenWeeklySummary = async (
  employeeId: number,
  weekNumber: number,
  month: number,
  year: number,
) => {
  const response = await api.get(
    `/weekly-summary/employee/${employeeId}/has-worked`,
    {
      params: { weekNumber, month, year },
    },
  );
  return response.data.hasWorked;
};

export const createWeeklySummary = async (
  newWeeklySummary: Omit<WeeklySummary, "id">,
) => {
  const response = await api.post("/weekly-summary", newWeeklySummary);
  invalidateCache("/weekly-summary");
  return response.data;
};

export const updateWeeklySummary = async (
  id: number,
  updatedWeeklySummary: Partial<WeeklySummary>,
) => {
  const response = await api.put(`/weekly-summary/${id}`, updatedWeeklySummary);
  invalidateCache("/weekly-summary");
  return response.data;
};

export const deleteWeeklySummary = async (id: number) => {
  const response = await api.delete(`/weekly-summary/${id}`);
  invalidateCache("/weekly-summary");
  return { id, message: response.data };
};
