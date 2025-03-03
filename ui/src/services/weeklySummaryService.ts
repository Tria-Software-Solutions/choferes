import { WeeklySummary } from "../models/WeeklySummary";
import api from "./api";

export const getWeeklySummaries = async () => {
  const response = await api.get("/weekly-summary");
  return response.data;
};

export const createWeeklySummary = async (
  newWeeklySummary: Omit<WeeklySummary, "id">
) => {
  const response = await api.post("/weekly-summary", newWeeklySummary);
  return response.data;
};

export const updateWeeklySummary = async (
  id: number,
  updatedWeeklySummary: Partial<WeeklySummary>
) => {
  await api.put(`/weekly-summary/${id}`, updatedWeeklySummary);
};

export const deleteWeeklySummary = async (id: number) => {
  await api.delete(`/weekly-summary/${id}`);
};

export const calculateTotalWeeklyHours = (weeklySummaries: WeeklySummary[]) => {
  return weeklySummaries.reduce(
    (total, summary) => total + summary.totalHours,
    0
  );
};
