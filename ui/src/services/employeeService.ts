import { Employee } from "../models/Employee";
import api from "./api";

export const getEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

export const createEmployee = async (newEmployee: Omit<Employee, "id">) => {
  const response = await api.post("/employees", newEmployee);
  return response.data;
};

export const updateEmployee = async (
  id: number,
  updatedEmployee: Partial<Employee>
) => {
  const response = await api.put(`/employees/${id}`, updatedEmployee);
  return response.data;
};

export const deleteEmployee = async (id: number) => {
  const response = await api.delete(`/employees/${id}`);
  return { id, message: response.data };
};
