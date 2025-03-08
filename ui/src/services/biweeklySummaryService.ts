import { BiweeklySummary } from "../models/BiweeklySummary";
import api from "./api";

export const getBiweeklySummaries = async () => {
  const response = await api.get("/biweekly-summary");
  return response.data;
};

export const createBiweeklySummary = async (
  newBiweeklySummary: Omit<BiweeklySummary, "id">
) => {
  const response = await api.post("/biweekly-summary", newBiweeklySummary);
  return response.data;
};

export const updateBiweeklySummary = async (
  id: number,
  updatedBiweeklySummary: Partial<BiweeklySummary>
) => {
  await api.put(`/biweekly-summary/${id}`, updatedBiweeklySummary);
};

export const deleteBiweeklySummary = async (id: number) => {
  await api.delete(`/biweekly-summary/${id}`);
};
