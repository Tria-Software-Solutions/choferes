import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as EmployeeService from "../../services/employeeService";
import { Employee } from "../../models/Employee";
import { RootState } from "../store";

interface EmployeeState {
  employees: Employee[];
  totalCountEmployees: number;
  isLoadingEmployees: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  totalCountEmployees: 0,
  isLoadingEmployees: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const employees = await EmployeeService.getEmployees();
      return employees;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch employees"
      );
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (newEmployee: Omit<Employee, "id">, { rejectWithValue }) => {
    try {
      const createdEmployee = await EmployeeService.createEmployee(newEmployee);
      return createdEmployee;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to create employee"
      );
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (
    { id, updatedEmployee }: { id: number; updatedEmployee: Partial<Employee> },
    { rejectWithValue }
  ) => {
    try {
      await EmployeeService.updateEmployee(id, updatedEmployee);
      return { id, updatedEmployee };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update employee"
      );
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id: number, { rejectWithValue }) => {
    try {
      await EmployeeService.deleteEmployee(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to delete employee"
      );
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoadingEmployees = true;
        state.error = null;
      })
      .addCase(
        fetchEmployees.fulfilled,
        (state, action: PayloadAction<Employee[]>) => {
          state.employees = action.payload;
          state.totalCountEmployees = action.payload.length;
          state.isLoadingEmployees = false;
        }
      )
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoadingEmployees = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch employees";
      })
      .addCase(
        createEmployee.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          state.employees.push(action.payload);
          state.totalCountEmployees += 1;
        }
      )
      .addCase(
        updateEmployee.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: number;
            updatedEmployee: Partial<Employee>;
          }>
        ) => {
          const { id, updatedEmployee } = action.payload;
          state.employees = state.employees.map((employee) =>
            employee.id === id ? { ...employee, ...updatedEmployee } : employee
          );
        }
      )
      .addCase(
        deleteEmployee.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.employees = state.employees.filter(
            (employee) => employee.id !== action.payload
          );
          state.totalCountEmployees -= 1;
        }
      );
  },
});

export const selectEmployees = (state: RootState) => state.employees.employees;
export const selectTotalCountEmployees = (state: RootState) =>
  state.employees.totalCountEmployees;
export const selectIsLoadingEmployees = (state: RootState) =>
  state.employees.isLoadingEmployees;
export const selectEmployeeError = (state: RootState) => state.employees.error;

export default employeeSlice.reducer;
