import { MonthlySummary } from "../models/MonthlySummary";
import api from "./api";

export const getMonthlySummaries = async () => {
  const response = await api.get("/monthly-summary");
  return response.data;
};

export const getCurrentMonthlySummary = async (
  employeeId: number,
  month: number,
  year: number,
) => {
  const response = await api.get(`/monthly-summary/employee/${employeeId}`, {
    params: { month, year },
  });
  return response.data;
};

export const createMonthlySummary = async (
  newMonthlySummary: Omit<MonthlySummary, "id">,
) => {
  const response = await api.post("/monthly-summary", newMonthlySummary);
  return response.data;
};

export const updateMonthlySummary = async (
  id: number,
  updatedMonthlySummary: Partial<MonthlySummary>,
) => {
  const response = await api.put(
    `/monthly-summary/${id}`,
    updatedMonthlySummary,
  );
  return response.data;
};

export const deleteMonthlySummary = async (id: number) => {
  const response = await api.delete(`/monthly-summary/${id}`);
  return { id, message: response.data };
};
