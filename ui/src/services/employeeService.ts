import { Employee } from "../models/Employee";
import api from "./api";

export const fetchEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

export const addEmployee = async (newEmployee: Employee) => {
  await api.post("/employees", newEmployee);
};

export const updateEmployee = async (
  id: number,
  updatedEmployee: Partial<Employee>
) => {
  await api.put(`/employees/${id}`, updatedEmployee);
};

export const deleteEmployee = async (id: number) => {
  await api.delete(`/employees/${id}`);
};
