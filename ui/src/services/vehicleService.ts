import { Vehicle } from "../models/Vehicle";
import api from "./api";

export const fetchVehicles = async (
  page: number = 1,
  perPage: number = 10
): Promise<Vehicle[]> => {
  const response = await api.get("/vehicles", {
    params: { page, perPage },
  });
  return response.data;
};

export const addVehicle = async (vehicle: Vehicle) => {
  await api.post("/vehicles", vehicle);
};

export const getVehicleById = async (id: number): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const getVehiclesGroupedByDate = async (
  date: string,       
  page: number = 1,
  perPage: number = 10
): Promise<Vehicle[]> => {
  const response = await api.get("/vehicles/grouped/by-date", {
    params: { date, page, perPage },
  });
  return response.data;
};

export const updateVehicle = async (
  id: number,        
  vehicle: Partial<Vehicle>
) => {
  await api.put(`/vehicles/${id}`, vehicle);
};

export const deleteVehicle = async (id: number) => {
  await api.delete(`/vehicles/${id}`);
};
