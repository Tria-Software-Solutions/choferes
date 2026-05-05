import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as EmployeeService from "../../services/employeeService";
import { Employee } from "../../models/Employee";
import { RootState } from "../store";

// employeeSlice manages the state and async logic for employee data
// Includes fetching, creating, updating, and deleting employees
// State: employees array, total count, loading state, error
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
    // Fetches all employees from the API
    try {
      const response = await EmployeeService.getEmployees();
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.employees)) {
        return response.employees;
      } else {
        return [];
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch employees";
      return rejectWithValue(errorMessage);
    }
  },
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (newEmployee: Omit<Employee, "id">, { rejectWithValue }) => {
    // Creates a new employee via the API
    try {
      const createdEmployee = await EmployeeService.createEmployee(newEmployee);
      return createdEmployee;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create employee";
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async (
    { id, updatedEmployee }: { id: number; updatedEmployee: Partial<Employee> },
    { rejectWithValue },
  ) => {
    // Updates an employee by id via the API
    try {
      await EmployeeService.updateEmployee(id, updatedEmployee);
      // Fetch fresh data from server to ensure consistency
      const refreshedEmployee = await EmployeeService.getEmployeeById(id);
      return refreshedEmployee;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update employee";
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id: number, { rejectWithValue }) => {
    // Deletes an employee by id via the API
    try {
      await EmployeeService.deleteEmployee(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete employee";
      return rejectWithValue(errorMessage);
    }
  },
);

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handles async actions for employees
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
        },
      )
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoadingEmployees = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch employees";
      })
      .addCase(
        createEmployee.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          state.employees = [...state.employees, action.payload];
          state.totalCountEmployees += 1;
        },
      )
      .addCase(
        updateEmployee.fulfilled,
        (state, action: PayloadAction<Employee>) => {
          // Update a employee in the state after editing with fresh data from server
          const updatedEmployee = action.payload;
          state.employees = state.employees.map((employee) =>
            employee.id === updatedEmployee.id ? updatedEmployee : employee,
          );
        },
      )
      .addCase(
        deleteEmployee.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.employees = state.employees.filter(
            (employee) => employee.id !== action.payload,
          );
          state.totalCountEmployees -= 1;
        },
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
