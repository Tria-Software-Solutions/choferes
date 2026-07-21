import { Employee } from "../models/Employee";
import api, { invalidateCache } from "./api";

export const getEmployees = async (search?: string) => {
  const params: Record<string, string | number> = {
    _t: Date.now(),
  };
  if (search) params.search = search;

  const response = await api.get("/employees", { params });
  return response.data.data;
};

export const getEmployeeById = async (id: number) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (newEmployee: Omit<Employee, "id">) => {
  const response = await api.post("/employees", newEmployee);
  invalidateCache("/employees");
  return response.data;
};

export const updateEmployee = async (
  id: number,
  updatedEmployee: Partial<Employee>,
) => {
  const response = await api.put(`/employees/${id}`, updatedEmployee);
  invalidateCache("/employees");
  return response.data;
};

export const deleteEmployee = async (id: number) => {
  const response = await api.delete(`/employees/${id}`);
  invalidateCache("/employees");
  return { id, message: response.data };
};
