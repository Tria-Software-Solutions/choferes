import { HoursWorked } from "../models/HoursWorked";
import api from "./api";

export const getHoursWorked = async () => {
  const response = await api.get("/hours");
  return response.data;
};

export const createHoursWorked = async (newHours: Omit<HoursWorked, "id">) => {
  const response = await api.post("/hours", newHours);
  return response.data;
};

export const updateHoursWorked = async (
  id: number,
  updatedHours: Partial<HoursWorked>,
) => {
  const response = await api.put(`/hours/${id}`, updatedHours);
  return response.data;
};

export const deleteHoursWorked = async (id: number) => {
  const response = await api.delete(`/hours/${id}`);
  return { id, message: response.data };
};
