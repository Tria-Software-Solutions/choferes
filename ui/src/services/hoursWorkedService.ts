import { HoursWorked } from "../models/HoursWorked";
import api, { invalidateCache } from "./api";

export const getHoursWorked = async () => {
  const response = await api.get("/hours", {
    params: {
      _t: Date.now()
    }
  });
  return response.data;
};

export const getHoursWorkedById = async (id: number) => {
  const response = await api.get(`/hours/${id}`);
  return response.data;
};

export const createHoursWorked = async (newHoursWorked: Omit<HoursWorked, "id">) => {
  const response = await api.post("/hours", newHoursWorked);
  invalidateCache("/hours");
  return response.data;
};

export const updateHoursWorked = async (
  id: number,
  updatedHoursWorked: Partial<HoursWorked>,
) => {
  const response = await api.put(`/hours/${id}`, updatedHoursWorked);
  invalidateCache("/hours");
  return response.data;
};

export const deleteHoursWorked = async (id: number) => {
  const response = await api.delete(`/hours/${id}`);
  invalidateCache("/hours");
  return { id, message: response.data };
};
