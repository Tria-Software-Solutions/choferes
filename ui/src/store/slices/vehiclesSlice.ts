import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as VehicleService from "../../services/vehicleService";
import { Vehicle } from "../../models/Vehicle";
import { RootState } from "../store";

interface VehicleState {
  vehicles: Vehicle[];
  allVehicles: Vehicle[];
  totalCountVehicles: number;
  totalCountAllVehicles: number;
  isLoadingVehicles: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  allVehicles: [],
  totalCountVehicles: 0,
  totalCountAllVehicles: 0,
  isLoadingVehicles: false,
  error: null,
};

// Fetch vehicles with pagination from the API
export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (
    { page = 1, perPage = 10 }: { page?: number; perPage?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await VehicleService.getVehicles(page, perPage);
      if (Array.isArray(response)) {
        return response;
      } else if (
        response &&
        Array.isArray((response as { vehicles: unknown }).vehicles)
      ) {
        return (response as { vehicles: Vehicle[] }).vehicles;
      } else {
        return [];
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch vehicles",
      );
    }
  },
);

// Fetch vehicles by date from the API
export const fetchVehiclesByDate = createAsyncThunk(
  "vehicles/fetchVehiclesByDate",
  async (date: string, { rejectWithValue }) => {
    try {
      const vehicles = await VehicleService.getVehiclesByDate(date);
      return vehicles;
    } catch (error: unknown) {
      return rejectWithValue(
        (error as { response?: { data?: string } })?.response?.data ||
          "Failed to fetch vehicles by date",
      );
    }
  },
);

// Create a new vehicle via the API
export const createVehicle = createAsyncThunk(
  "vehicles/createVehicle",
  async (newVehicle: Omit<Vehicle, "id">, { rejectWithValue }) => {
    try {
      const createdVehicle = await VehicleService.createVehicle(newVehicle);
      return createdVehicle;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create vehicle",
      );
    }
  },
);

// Update a vehicle by id via the API
export const updateVehicle = createAsyncThunk(
  "vehicles/updateVehicle",
  async (
    { id, updatedVehicle }: { id: number; updatedVehicle: Partial<Vehicle> },
    { rejectWithValue },
  ) => {
    try {
      const updatedVehicleFromBackend = await VehicleService.updateVehicle(
        id,
        updatedVehicle,
      );
      return updatedVehicleFromBackend;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update vehicle",
      );
    }
  },
);

// Delete a vehicle by id via the API
export const deleteVehicle = createAsyncThunk(
  "vehicles/deleteVehicle",
  async (id: number, { rejectWithValue }) => {
    try {
      await VehicleService.deleteVehicle(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete vehicle",
      );
    }
  },
);

const vehicleSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle async actions for vehicles
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.isLoadingVehicles = true;
        state.error = null;
      })
      .addCase(
        fetchVehicles.fulfilled,
        (state, action: PayloadAction<Vehicle[]>) => {
          // Update all vehicles in the state
          state.allVehicles = action.payload;
          state.totalCountAllVehicles = action.payload.length;
          state.isLoadingVehicles = false;
        },
      )
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.isLoadingVehicles = false;
        state.error = action.payload as string;
      })
      .addCase(
        fetchVehiclesByDate.fulfilled,
        (state, action: PayloadAction<Vehicle[]>) => {
          // Update vehicles in the state for a specific date
          state.vehicles = action.payload;
          state.totalCountVehicles = action.payload.length;
        },
      )
      .addCase(
        createVehicle.fulfilled,
        (state, action: PayloadAction<Vehicle>) => {
          // Add the newly created vehicle to the state
          state.vehicles.push(action.payload);
          state.allVehicles.push(action.payload);
          state.totalCountAllVehicles += 1;
        },
      )
      .addCase(createVehicle.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(
        updateVehicle.fulfilled,
        (state, action: PayloadAction<Vehicle>) => {
          // Update a vehicle in the state after editing
          const updatedVehicle = action.payload;
          const id = updatedVehicle.id;

          const updatedAllVehicles = state.allVehicles.map((vehicle) =>
            vehicle.id === id ? updatedVehicle : vehicle,
          );
          state.allVehicles = updatedAllVehicles;

          const updatedVehicles = state.vehicles.map((vehicle) =>
            vehicle.id === id ? updatedVehicle : vehicle,
          );
          state.vehicles = updatedVehicles;
        },
      )
      .addCase(
        deleteVehicle.fulfilled,
        (state, action: PayloadAction<number>) => {
          // Remove a vehicle from the state by ID
          state.vehicles = state.vehicles.filter(
            (vehicle) => vehicle.id !== action.payload,
          );
          state.allVehicles = state.allVehicles.filter(
            (vehicle) => vehicle.id !== action.payload,
          );
          state.totalCountAllVehicles = state.allVehicles.length;
        },
      );
  },
});

// Selector to get vehicles for the current date from the state
export const selectVehicles = (state: RootState) => state.vehicles.vehicles;
// Selector to get all vehicles from the state
export const selectAllVehicles = (state: RootState) =>
  state.vehicles.allVehicles;
// Selector to get the total count of vehicles for the current date
export const selectTotalCountVehicles = (state: RootState) =>
  state.vehicles.totalCountVehicles;
// Selector to get the total count of all vehicles
export const selectTotalCountAllVehicles = (state: RootState) =>
  state.vehicles.totalCountAllVehicles;
// Selector to get the loading state for vehicles
export const selectIsLoadingVehicles = (state: RootState) =>
  state.vehicles.isLoadingVehicles;
// Selector to get the error state for vehicles
export const selectVehicleError = (state: RootState) => state.vehicles.error;

export default vehicleSlice.reducer;
