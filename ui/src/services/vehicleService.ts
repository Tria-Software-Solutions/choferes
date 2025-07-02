import { Vehicle } from "../models/Vehicle";
import api from "./api";

// Fetches a paginated list of vehicles
export const getVehicles = async (
  page = 1,
  perPage = 10,
): Promise<Vehicle[]> => {
  const response = await api.get("/vehicles", {
    params: { page, perPage },
  });
  return response.data;
};

// Fetches a vehicle by its ID
export const getVehicleById = async (id: number): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

// Fetches vehicles by a specific date
export const getVehiclesByDate = async (date: string): Promise<Vehicle[]> => {
  const response = await api.get("/vehicles/by-date", {
    params: { date },
  });
  return response.data;
};

// Creates a new vehicle (sets parkingDate if not provided)
export const createVehicle = async (newVehicle: Omit<Vehicle, "id">) => {
  const vehicleData = {
    ...newVehicle,
    parkingDate: newVehicle.parkingDate || new Date(),
  };

  const response = await api.post("/vehicles", vehicleData);
  return response.data;
};

// Updates a vehicle by ID
export const updateVehicle = async (id: number, vehicle: Partial<Vehicle>) => {
  const response = await api.put(`/vehicles/${id}`, vehicle);
  return response.data;
};

// Deletes a vehicle by ID
export const deleteVehicle = async (id: number) => {
  const response = await api.delete(`/vehicles/${id}`);
  return { id, message: response.data };
};
