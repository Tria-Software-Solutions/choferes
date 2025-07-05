import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as ScheduleService from "../../services/scheduleService";
import { Schedule } from "../../models/Schedule";
import { RootState } from "../store";

// schedulesSlice manages the state and async logic for schedule data
// Includes fetching, creating, updating, and deleting schedules
// State: schedules array, total count, loading state, error

interface SchedulesState {
  schedules: Schedule[];
  totalCountSchedules: number;
  isLoadingSchedules: boolean;
  error: string | null;
}

const initialState: SchedulesState = {
  schedules: [],
  totalCountSchedules: 0,
  isLoadingSchedules: false,
  error: null,
};

// Fetch all schedules from the API
export const fetchSchedules = createAsyncThunk(
  "schedules/fetchSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ScheduleService.getSchedules();
      if (Array.isArray(response)) {
        return response;
      } else if (
        typeof response === "object" &&
        "schedules" in response &&
        Array.isArray((response as { schedules: unknown }).schedules)
      ) {
        return (response as { schedules: Schedule[] }).schedules;
      } else {
        return [];
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch schedules",
      );
    }
  },
);

// Create a new schedule via the API
export const createSchedule = createAsyncThunk(
  "schedules/createSchedule",
  async (newSchedule: Omit<Schedule, "id">, { rejectWithValue }) => {
    try {
      const createdSchedule = await ScheduleService.createSchedule(newSchedule);
      return createdSchedule;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create schedule",
      );
    }
  },
);

// Update a schedule by id via the API
export const updateSchedule = createAsyncThunk(
  "schedules/updateSchedule",
  async (
    args: { id: number; updatedSchedule: Partial<Schedule> },
    { rejectWithValue },
  ) => {
    try {
      await ScheduleService.updateSchedule(args.id, args.updatedSchedule);
      // Fetch fresh data from server to ensure consistency
      const refreshedSchedule = await ScheduleService.getScheduleById(args.id);
      return refreshedSchedule;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update schedule",
      );
    }
  },
);

// Delete a schedule by id via the API
export const deleteSchedule = createAsyncThunk(
  "schedules/deleteSchedule",
  async (id: number, { rejectWithValue }) => {
    try {
      await ScheduleService.deleteSchedule(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete schedule",
      );
    }
  },
);

const schedulesSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle async actions for schedules
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.isLoadingSchedules = true;
        state.error = null;
      })
      .addCase(
        fetchSchedules.fulfilled,
        (state, action: PayloadAction<Schedule[]>) => {
          state.schedules = action.payload;
          state.totalCountSchedules = action.payload.length;
          state.isLoadingSchedules = false;
        },
      )
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.isLoadingSchedules = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch schedules";
      })
      .addCase(
        createSchedule.fulfilled,
        (state, action: PayloadAction<Schedule>) => {
          // Add the newly created schedule to the state
          state.schedules.push(action.payload);
          state.totalCountSchedules += 1;
        },
      )
      .addCase(
        updateSchedule.fulfilled,
        (state, action: PayloadAction<Schedule>) => {
          // Update a schedule in the state after editing with fresh data from server
          const updatedSchedule = action.payload;
          state.schedules = state.schedules.map((schedule) =>
            schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
          );
        },
      )
      .addCase(
        deleteSchedule.fulfilled,
        (state, action: PayloadAction<number>) => {
          // Remove a schedule from the state by ID
          state.schedules = state.schedules.filter(
            (schedule) => schedule.id !== action.payload,
          );
          state.totalCountSchedules -= 1;
        },
      );
  },
});

// Selector to get all schedules from the state
export const selectSchedules = (state: RootState) => state.schedules.schedules;
// Selector to get the total count of schedules
export const selectTotalCountSchedules = (state: RootState) =>
  state.schedules.totalCountSchedules;
// Selector to get the loading state for schedules
export const selectIsLoadingSchedules = (state: RootState) =>
  state.schedules.isLoadingSchedules;
// Selector to get the error state for schedules
export const selectSchedulesError = (state: RootState) => state.schedules.error;

export default schedulesSlice.reducer;
