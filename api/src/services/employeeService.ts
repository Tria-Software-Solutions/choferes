import { Employee } from "../models/Employee";

export const createEmployee = async (data: Omit<Employee, "id">) => {
  return Employee.create(data);
};

export const getAllEmployees = async () => {
  return Employee.findAll();
};

export const getEmployeeById = async (id: number) => {
  return Employee.findByPk(id);
};

export const updateEmployee = async (
  id: number,
  data: Omit<Employee, "id">
) => {
  await Employee.update(data, { where: { id } });
  return Employee.findByPk(id);
};

export const deleteEmployee = async (id: number) => {
  return Employee.destroy({ where: { id } });
};
