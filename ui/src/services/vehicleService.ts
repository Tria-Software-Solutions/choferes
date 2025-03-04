import { Vehicle } from "../models/Vehicle";
import api from "./api";

export const getVehicles = async (
  page: number = 1,
  perPage: number = 10
): Promise<Vehicle[]> => {
  const response = await api.get("/vehicles", {
    params: { page, perPage },
  });
  return response.data;
};

export const getVehicleById = async (id: number): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const getVehiclesByDate = async (date: string): Promise<Vehicle[]> => {
  const response = await api.get("/vehicles/by-date", {
    params: { date },
  });
  return response.data;
};

export const createVehicle = async (newVehicle: Omit<Vehicle, "id">) => {
  const response = await api.post("/vehicles", newVehicle);
  return response.data;
};

export const updateVehicle = async (id: number, vehicle: Partial<Vehicle>) => {
  await api.put(`/vehicles/${id}`, vehicle);
};

export const deleteVehicle = async (id: number) => {
  await api.delete(`/vehicles/${id}`);
};
