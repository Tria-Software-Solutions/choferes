import { Employee } from "../models/Employee";
import { VacationAccrual } from "../models/VacationAccrual";
import api, { invalidateCache } from "./api";

export const getEmployees = async (search?: string, isActive?: boolean) => {
  const params: Record<string, string | number> = {
    _t: Date.now(),
    limit: 10000,
  };
  if (search) params.search = search;
  if (isActive !== undefined) params.isActive = isActive ? "true" : "false";

  const response = await api.get("/employees", { params });
  return response.data.data;
};

export const getEmployeeById = async (id: number) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

// Acumulación de vacaciones según la ley de Costa Rica (art. 153, prorrateado).
export const getVacationAccrual = async (id: number): Promise<VacationAccrual> => {
  const response = await api.get(`/employees/${id}/vacation-accrual`, {
    headers: { "x-no-cache": "1" },
  });
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

// Upload avatar for an employee (multipart/form-data)
export const uploadEmployeeAvatar = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post(`/employees/${id}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });
  return response.data;
};

// Delete avatar for an employee
export const deleteEmployeeAvatar = async (id: number) => {
  const response = await api.delete(`/employees/${id}/avatar`);
  return response.data;
};
