import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as HoursWorkedService from "../../services/hoursWorkedService";
import { HoursWorked } from "../../models/HoursWorked";
import { RootState } from "../store";

interface HoursWorkedState {
  hoursWorked: HoursWorked[];
  totalCountHoursWorked: number;
  isLoadingHoursWorked: boolean;
  error: string | null;
}

const initialState: HoursWorkedState = {
  hoursWorked: [],
  totalCountHoursWorked: 0,
  isLoadingHoursWorked: false,
  error: null,
};

export const fetchHoursWorked = createAsyncThunk(
  "hoursWorked/fetchHoursWorked",
  async (_, { rejectWithValue }) => {
    try {
      const response = await HoursWorkedService.getHoursWorked();
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.hoursWorked)) {
        return response.hoursWorked;
      } else {
        return [];
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch hours worked",
      );
    }
  },
);

export const createHoursWorked = createAsyncThunk(
  "hoursWorked/createHoursWorked",
  async (newHours: Omit<HoursWorked, "id">, { rejectWithValue }) => {
    try {
      // Convert Date objects to ISO strings for serialization
      const serializedHours = {
        ...newHours,
        date: newHours.date instanceof Date ? newHours.date.toISOString() : newHours.date,
      };
      const createdHours = await HoursWorkedService.createHoursWorked(serializedHours);
      return createdHours;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to create hours worked",
      );
    }
  },
);

export const updateHoursWorked = createAsyncThunk(
  "hoursWorked/updateHoursWorked",
  async (
    { id, updatedHours }: { id: number; updatedHours: Partial<HoursWorked> },
    { rejectWithValue },
  ) => {
    try {
      // Convert Date objects to ISO strings for serialization
      const serializedHours = {
        ...updatedHours,
        date: updatedHours.date instanceof Date ? updatedHours.date.toISOString() : updatedHours.date,
      };
      await HoursWorkedService.updateHoursWorked(id, serializedHours);
      // Fetch fresh data from server to ensure consistency
      const refreshedHours = await HoursWorkedService.getHoursWorkedById(id);
      return refreshedHours;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to update hours worked",
      );
    }
  },
);

export const createOrUpdateHoursWorked = createAsyncThunk(
  "hoursWorked/createOrUpdateHoursWorked",
  async (
    newHours: Omit<HoursWorked, "id"> | HoursWorked,
    { rejectWithValue },
  ) => {
    try {
      // Convert Date objects to ISO strings for serialization
      const serializedHours = {
        ...newHours,
        date: newHours.date instanceof Date ? newHours.date.toISOString() : newHours.date,
      };

      // Check if id exists and is a valid positive number (not 0)
      if ("id" in serializedHours && serializedHours.id && serializedHours.id > 0) {
        const updatedHoursWorked = await HoursWorkedService.updateHoursWorked(
          serializedHours.id,
          serializedHours,
        );
        return updatedHoursWorked;
      } else {
        // Remove id if it's 0 or invalid, then create
        const hoursToCreate = "id" in serializedHours 
          ? { date: serializedHours.date, employeeId: serializedHours.employeeId, scheduleId: serializedHours.scheduleId }
          : serializedHours;
        const createdHoursWorked =
          await HoursWorkedService.createHoursWorked(hoursToCreate);
        return createdHoursWorked;
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to create or update hours worked",
      );
    }
  },
);

export const deleteHoursWorked = createAsyncThunk(
  "hoursWorked/deleteHoursWorked",
  async (id: number, { rejectWithValue }) => {
    try {
      await HoursWorkedService.deleteHoursWorked(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to delete hours worked",
      );
    }
  },
);

const hoursWorkedSlice = createSlice({
  name: "hoursWorked",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHoursWorked.pending, (state) => {
        state.isLoadingHoursWorked = true;
        state.error = null;
      })
      .addCase(
        fetchHoursWorked.fulfilled,
        (state, action: PayloadAction<HoursWorked[]>) => {
          state.hoursWorked = action.payload;
          state.totalCountHoursWorked = action.payload.length;
          state.isLoadingHoursWorked = false;
        },
      )
      .addCase(fetchHoursWorked.rejected, (state, action) => {
        state.isLoadingHoursWorked = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch hours worked";
      })
      .addCase(
        createHoursWorked.fulfilled,
        (state, action: PayloadAction<HoursWorked>) => {
          state.hoursWorked.push(action.payload);
          state.totalCountHoursWorked += 1;
        },
      )
      .addCase(
        updateHoursWorked.fulfilled,
        (state, action: PayloadAction<HoursWorked>) => {
          // Update hours worked in the state after editing with fresh data from server
          const updatedHours = action.payload;
          state.hoursWorked = state.hoursWorked.map((hours) =>
            hours.id === updatedHours.id ? updatedHours : hours,
          );
        },
      )
      .addCase(createOrUpdateHoursWorked.fulfilled, (state, action) => {
        const updatedHoursWorked = action.payload;
        const index = state.hoursWorked.findIndex(
          (hours) => hours.id === updatedHoursWorked.id,
        );

        if (index !== -1) {
          state.hoursWorked[index] = updatedHoursWorked;
        } else {
          state.hoursWorked.push(updatedHoursWorked);
        }
      })
      .addCase(
        deleteHoursWorked.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.hoursWorked = state.hoursWorked.filter(
            (hours) => hours.id !== action.payload,
          );
          state.totalCountHoursWorked -= 1;
        },
      );
  },
});

export const selectHoursWorked = (state: RootState) =>
  state.hoursWorked.hoursWorked;
export const selectTotalCountHoursWorked = (state: RootState) =>
  state.hoursWorked.totalCountHoursWorked;
export const selectIsLoadingHoursWorked = (state: RootState) =>
  state.hoursWorked.isLoadingHoursWorked;
export const selectHoursWorkedError = (state: RootState) =>
  state.hoursWorked.error;

export default hoursWorkedSlice.reducer;
