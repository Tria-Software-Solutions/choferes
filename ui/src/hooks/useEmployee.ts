import { useState, useEffect, useCallback } from "react";
import * as EmployeeService from "../services/employeeService";
import { Employee } from "../models/Employee";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCountEmployees, setTotalCountEmployees] = useState(0);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const getEmployees = useCallback(async () => {
    setIsLoadingEmployees(true);
    try {
      const data = await EmployeeService.getEmployees();
      setEmployees(data);
      setTotalCountEmployees(data.length);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  const createEmployee = async (newEmployee: Omit<Employee, "id">) => {
    const createdEmployee = await EmployeeService.createEmployee(newEmployee);
    setEmployees((prev) => [...prev, createdEmployee]);
    setTotalCountEmployees((prev) => prev + 1);
  };

  const updateEmployee = async (
    id: number,
    updatedEmployee: Partial<Employee>
  ) => {
    await EmployeeService.updateEmployee(id, updatedEmployee);
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id ? { ...employee, ...updatedEmployee } : employee
      )
    );
  };

  const deleteEmployee = async (id: number) => {
    await EmployeeService.deleteEmployee(id);
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    setTotalCountEmployees((prev) => prev - 1);
  };

  useEffect(() => {
    getEmployees();
  }, [getEmployees]);

  return {
    employees,
    totalCountEmployees,
    isLoadingEmployees,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
