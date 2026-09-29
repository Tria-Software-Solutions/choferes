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

export type EmployeeBiweeklyHours = {
  employeeId: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
};

export type BiweeklyHoursResponse = {
  biweekNumber: number;
  year: number;
  summaries: EmployeeBiweeklyHours[];
};

// Horas de la quincena por empleado (columnas de Planilla). El backend las
// calcula con la misma regla de horas extra que el comprobante de pago.
export const getEmployeesBiweeklyHours = async (): Promise<BiweeklyHoursResponse> => {
  const response = await api.get("/employees/hours-summary");
  return response.data;
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

export interface EmployeeAccess {
  hasUser: boolean;
  userId: number | null;
  username: string | null;
  roles: { id: number; name: string }[];
  /** true cuando la cuenta existe pero quedó sin ningún rol. */
  needsRole: boolean;
}

// Cuenta de acceso al sistema del empleado (usuario vinculado + roles).
export const getEmployeeAccess = async (id: number): Promise<EmployeeAccess> => {
  const response = await api.get(`/employees/${id}/access`, {
    headers: { "x-no-cache": "1" },
  });
  return response.data;
};

// Asigna el rol del puesto del empleado cuando la cuenta quedó sin rol.
export const assignDefaultEmployeeRole = async (id: number): Promise<EmployeeAccess> => {
  const response = await api.post(`/employees/${id}/assign-default-role`);
  invalidateCache("/employees");
  return response.data;
};

// Enlaza el empleado a un usuario (botón "Activar acceso al sistema").
// `created=false` significa que el empleado ya tenía cuenta: en ese caso no
// hay contraseña temporal que entregar.
export const linkEmployeeToUser = async (id: number): Promise<{
  userId: number;
  username?: string;
  tempPassword?: string;
  created: boolean;
}> => {
  const response = await api.post(`/employees/${id}/link-user`);
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
