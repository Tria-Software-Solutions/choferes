import { HoursWorked } from "../models/HoursWorked";
import api, { invalidateCache } from "./api";

export const getHoursWorked = async () => {
  const response = await api.get("/hours-worked", {
    params: {
      _t: Date.now()
    }
  });
  return response.data;
};

export const getHoursWorkedById = async (id: number) => {
  const response = await api.get(`/hours-worked/${id}`);
  return response.data;
};

export const createHoursWorked = async (newHoursWorked: Omit<HoursWorked, "id">) => {
  const response = await api.post("/hours-worked", newHoursWorked);
  invalidateCache("/hours-worked");
  return response.data;
};

export const updateHoursWorked = async (
  id: number,
  updatedHoursWorked: Partial<HoursWorked>,
) => {
  const response = await api.put(`/hours-worked/${id}`, updatedHoursWorked);
  invalidateCache("/hours-worked");
  return response.data;
};

export const deleteHoursWorked = async (id: number) => {
  const response = await api.delete(`/hours-worked/${id}`);
  invalidateCache("/hours-worked");
  return { id, message: response.data };
};
