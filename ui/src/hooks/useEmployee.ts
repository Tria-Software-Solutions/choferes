import { useState, useEffect, useCallback } from "react";
import * as EmployeeService from "../services/employeeService";
import { Employee } from "../models/Employee";

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await EmployeeService.fetchEmployees();
      setEmployees(data);
      setTotalCount(data.length);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddEmployee = async (newEmployee: Employee) => {
    await EmployeeService.addEmployee(newEmployee);
    setEmployees((prev) => [...prev, newEmployee]);
    setTotalCount((prev) => prev + 1);
  };

  const handleUpdateEmployee = async (
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

  const handleDeleteEmployee = async (id: number) => {
    await EmployeeService.deleteEmployee(id);
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    setTotalCount((prev) => prev - 1);
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    totalCount,
    isLoading,
    fetchEmployees,
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
  };
};
