import { MonthlySummary } from "../models/MonthlySummary";
import api from "./api";

export const getMonthlySummaries = async () => {
  const response = await api.get("/monthly-summary");
  return response.data;
};

export const createMonthlySummary = async (
  newMonthlySummary: Omit<MonthlySummary, "id">
) => {
  const response = await api.post("/monthly-summary", newMonthlySummary);
  return response.data;
};

export const updateMonthlySummary = async (
  id: number,
  updatedMonthlySummary: Partial<MonthlySummary>
) => {
  await api.put(`/monthly-summary/${id}`, updatedMonthlySummary);
};

export const deleteMonthlySummary = async (id: number) => {
  await api.delete(`/monthly-summary/${id}`);
};

export const calculateTotalMonthlyHours = (
  monthlySummaries: MonthlySummary[]
) => {
  return monthlySummaries.reduce(
    (total, summary) => total + summary.totalHours,
    0
  );
};
