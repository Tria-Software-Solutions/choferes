import { BiweeklySummary } from "../models/BiweeklySummary";
import api from "./api";

export const getBiweeklySummaries = async () => {
  const response = await api.get("/biweekly-summary");
  return response.data;
};

export const getCurrentBiweeklySummary = async (
  employeeId: number,
  biweekNumber: number,
  month: number,
  year: number,
) => {
  const response = await api.get(`/biweekly-summary/employee/${employeeId}`, {
    params: { biweekNumber, month, year },
  });
  return response.data;
};

export const createBiweeklySummary = async (
  newBiweeklySummary: Omit<BiweeklySummary, "id">,
) => {
  const response = await api.post("/biweekly-summary", newBiweeklySummary);
  return response.data;
};

export const updateBiweeklySummary = async (
  id: number,
  updatedBiweeklySummary: Partial<BiweeklySummary>,
) => {
  const response = await api.put(
    `/biweekly-summary/${id}`,
    updatedBiweeklySummary,
  );
  return response.data;
};

export const deleteBiweeklySummary = async (id: number) => {
  const response = await api.delete(`/biweekly-summary/${id}`);
  return { id, message: response.data };
};
