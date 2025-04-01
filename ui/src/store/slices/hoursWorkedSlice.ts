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
      const hours = await HoursWorkedService.getHoursWorked();
      return hours;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch hours worked"
      );
    }
  }
);

export const createHoursWorked = createAsyncThunk(
  "hoursWorked/createHoursWorked",
  async (newHours: Omit<HoursWorked, "id">, { rejectWithValue }) => {
    try {
      const createdHours = await HoursWorkedService.createHoursWorked(newHours);
      return createdHours;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to create hours worked"
      );
    }
  }
);

export const updateHoursWorked = createAsyncThunk(
  "hoursWorked/updateHoursWorked",
  async (
    { id, updatedHours }: { id: number; updatedHours: Partial<HoursWorked> },
    { rejectWithValue }
  ) => {
    try {
      await HoursWorkedService.updateHoursWorked(id, updatedHours);
      return { id, updatedHours };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update hours worked"
      );
    }
  }
);

export const createOrUpdateHoursWorked = createAsyncThunk(
  "hoursWorked/createOrUpdateHoursWorked",
  async (
    newHours: Omit<HoursWorked, "id"> | HoursWorked,
    { dispatch, rejectWithValue }
  ) => {
    try {
      if ("id" in newHours) {
        await dispatch(updateHoursWorked({ id: newHours.id, updatedHours: newHours }));
        return { id: newHours.id, updatedHours: newHours };
      } else {
        const createdHours = await HoursWorkedService.createHoursWorked(newHours);
        return createdHours;
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to create or update hours worked"
      );
    }
  }
);

export const deleteHoursWorked = createAsyncThunk(
  "hoursWorked/deleteHoursWorked",
  async (id: number, { rejectWithValue }) => {
    try {
      await HoursWorkedService.deleteHoursWorked(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to delete hours worked"
      );
    }
  }
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
        }
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
        }
      )
      .addCase(
        updateHoursWorked.fulfilled,
        (
          state,
          action: PayloadAction<{ id: number; updatedHours: Partial<HoursWorked> }>
        ) => {
          const { id, updatedHours } = action.payload;
          state.hoursWorked = state.hoursWorked.map((hours) =>
            hours.id === id ? { ...hours, ...updatedHours } : hours
          );
        }
      )
      .addCase(
        createOrUpdateHoursWorked.fulfilled,
        (
          state,
          action: PayloadAction<HoursWorked | { id: number; updatedHours: Partial<HoursWorked> }>
        ) => {
          if ('id' in action.payload) {
            state.hoursWorked = state.hoursWorked.map((hours) =>
              'updatedHours' in action.payload && action.payload.id === hours.id
                ? { ...hours, ...action.payload.updatedHours }
                : hours
            );
          } else {
            state.hoursWorked.push(action.payload as HoursWorked);
            state.totalCountHoursWorked += 1;
          }
        }
      )
      .addCase(
        deleteHoursWorked.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.hoursWorked = state.hoursWorked.filter(
            (hours) => hours.id !== action.payload
          );
          state.totalCountHoursWorked -= 1;
        }
      );
  },
});

export const selectHoursWorked = (state: RootState) => state.hoursWorked.hoursWorked;
export const selectTotalCountHoursWorked = (state: RootState) => state.hoursWorked.totalCountHoursWorked;
export const selectIsLoadingHoursWorked = (state: RootState) => state.hoursWorked.isLoadingHoursWorked;
export const selectHoursWorkedError = (state: RootState) => state.hoursWorked.error;

export default hoursWorkedSlice.reducer;