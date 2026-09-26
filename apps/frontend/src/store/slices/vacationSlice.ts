import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as VacationService from "../../services/vacationService";
import { VacationQuery } from "../../services/vacationService";
import { Vacation } from "../../models/Vacation";
import { RootState } from "../store";
import { getApiErrorMessage } from "../../utils/apiError";

// vacationSlice manages the vacation requests of the employees.
interface VacationState {
  vacations: Vacation[];
  isLoadingVacations: boolean;
  error: string | null;
}

const initialState: VacationState = {
  vacations: [],
  isLoadingVacations: false,
  error: null,
};

export const fetchVacations = createAsyncThunk(
  "vacations/fetchVacations",
  async (params: VacationQuery = {}, { rejectWithValue }) => {
    try {
      const response = await VacationService.getVacations(params);
      return response.data;
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to fetch vacations");
      return rejectWithValue(message);
    }
  },
);

export const createVacation = createAsyncThunk(
  "vacations/createVacation",
  async (
    input: Parameters<typeof VacationService.createVacation>[0],
    { rejectWithValue },
  ) => {
    try {
      return await VacationService.createVacation(input);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to create vacation");
      return rejectWithValue(message);
    }
  },
);

export const updateVacation = createAsyncThunk(
  "vacations/updateVacation",
  async (
    { id, input }: { id: number; input: Parameters<typeof VacationService.updateVacation>[1] },
    { rejectWithValue },
  ) => {
    try {
      return await VacationService.updateVacation(id, input);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to update vacation");
      return rejectWithValue(message);
    }
  },
);

export const deleteVacation = createAsyncThunk(
  "vacations/deleteVacation",
  async (id: number, { rejectWithValue }) => {
    try {
      return await VacationService.deleteVacation(id);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to delete vacation");
      return rejectWithValue(message);
    }
  },
);

const upsertVacation = (state: VacationState, vacation: Vacation) => {
  const index = state.vacations.findIndex((item) => item.id === vacation.id);
  if (index >= 0) {
    state.vacations[index] = vacation;
  } else {
    state.vacations = [vacation, ...state.vacations];
  }
};

const vacationSlice = createSlice({
  name: "vacations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVacations.pending, (state) => {
        state.isLoadingVacations = true;
        state.error = null;
      })
      .addCase(fetchVacations.fulfilled, (state, action: PayloadAction<Vacation[]>) => {
        state.vacations = action.payload;
        state.isLoadingVacations = false;
      })
      .addCase(fetchVacations.rejected, (state, action) => {
        state.isLoadingVacations = false;
        state.error = (action.payload as string | null) || "Failed to fetch vacations";
      })
      .addCase(createVacation.fulfilled, (state, action: PayloadAction<Vacation>) => {
        upsertVacation(state, action.payload);
      })
      .addCase(updateVacation.fulfilled, (state, action: PayloadAction<Vacation>) => {
        upsertVacation(state, action.payload);
      })
      .addCase(deleteVacation.fulfilled, (state, action: PayloadAction<number>) => {
        state.vacations = state.vacations.filter(
          (vacation) => vacation.id !== action.payload,
        );
      });
  },
});

export const selectVacations = (state: RootState) => state.vacations.vacations;
export const selectIsLoadingVacations = (state: RootState) =>
  state.vacations.isLoadingVacations;
export const selectVacationsError = (state: RootState) => state.vacations.error;

export default vacationSlice.reducer;
