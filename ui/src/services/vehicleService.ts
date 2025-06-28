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
  const vehicleData = {
    ...newVehicle,
    parkingDate: newVehicle.parkingDate || new Date()
  };
  
  const response = await api.post("/vehicles", vehicleData);
  return response.data;
};

export const updateVehicle = async (id: number, vehicle: Partial<Vehicle>) => {
  const response = await api.put(`/vehicles/${id}`, vehicle);
  return response.data;
};

export const deleteVehicle = async (id: number) => {
  const response = await api.delete(`/vehicles/${id}`);
  return { id, message: response.data };
};
