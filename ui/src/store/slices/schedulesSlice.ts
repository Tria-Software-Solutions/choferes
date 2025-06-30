import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as ScheduleService from "../../services/scheduleService";
import { Schedule } from "../../models/Schedule";
import { RootState } from "../store";

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

export const fetchSchedules = createAsyncThunk(
  "schedules/fetchSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ScheduleService.getSchedules();
      if (Array.isArray(response)) {
        return response;
      } else if (
        response &&
        typeof response === "object" &&
        "schedules" in response &&
        Array.isArray((response as unknown).schedules)
      ) {
        return (response as unknown).schedules;
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

export const updateSchedule = createAsyncThunk(
  "schedules/updateSchedule",
  async (
    args: { id: number; updatedSchedule: Partial<Schedule> },
    { rejectWithValue },
  ) => {
    try {
      await ScheduleService.updateSchedule(args.id, args.updatedSchedule);
      return { id: args.id, updatedSchedule: args.updatedSchedule };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update schedule",
      );
    }
  },
);

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
          state.schedules.push(action.payload);
          state.totalCountSchedules += 1;
        },
      )
      .addCase(
        updateSchedule.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: number;
            updatedSchedule: Partial<Schedule>;
          }>,
        ) => {
          const { id, updatedSchedule } = action.payload;
          const updatedSchedules = state.schedules.map((schedule) =>
            schedule.id === id ? { ...schedule, ...updatedSchedule } : schedule,
          );
          state.schedules = updatedSchedules;
        },
      )
      .addCase(
        deleteSchedule.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.schedules = state.schedules.filter(
            (schedule) => schedule.id !== action.payload,
          );
          state.totalCountSchedules -= 1;
        },
      );
  },
});

export const selectSchedules = (state: RootState) => state.schedules.schedules;
export const selectTotalCountSchedules = (state: RootState) =>
  state.schedules.totalCountSchedules;
export const selectIsLoadingSchedules = (state: RootState) =>
  state.schedules.isLoadingSchedules;
export const selectSchedulesError = (state: RootState) => state.schedules.error;

export default schedulesSlice.reducer;
