import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as DisciplinaryService from "../../services/disciplinaryActionService";
import { DisciplinaryQuery, DisciplinaryInput } from "../../services/disciplinaryActionService";
import { DisciplinaryAction } from "../../models/DisciplinaryAction";
import { RootState } from "../store";
import { getApiErrorMessage } from "../../utils/apiError";

interface DisciplinaryState {
  disciplinaryActions: DisciplinaryAction[];
  isLoadingDisciplinary: boolean;
  error: string | null;
}

const initialState: DisciplinaryState = {
  disciplinaryActions: [],
  isLoadingDisciplinary: false,
  error: null,
};

export const fetchDisciplinaryActions = createAsyncThunk(
  "disciplinary/fetchDisciplinaryActions",
  async (params: DisciplinaryQuery = {}, { rejectWithValue }) => {
    try {
      const response = await DisciplinaryService.getDisciplinaryActions(params);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch disciplinary actions"),
      );
    }
  },
);

export const createDisciplinaryAction = createAsyncThunk(
  "disciplinary/createDisciplinaryAction",
  async (
    { employeeId, input }: { employeeId: number; input: DisciplinaryInput },
    { rejectWithValue },
  ) => {
    try {
      return await DisciplinaryService.createDisciplinaryAction(employeeId, input);
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create disciplinary action"),
      );
    }
  },
);

export const updateDisciplinaryAction = createAsyncThunk(
  "disciplinary/updateDisciplinaryAction",
  async (
    { id, input }: { id: number; input: Partial<DisciplinaryInput> },
    { rejectWithValue },
  ) => {
    try {
      return await DisciplinaryService.updateDisciplinaryAction(id, input);
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update disciplinary action"),
      );
    }
  },
);

export const deleteDisciplinaryAction = createAsyncThunk(
  "disciplinary/deleteDisciplinaryAction",
  async (id: number, { rejectWithValue }) => {
    try {
      return await DisciplinaryService.deleteDisciplinaryAction(id);
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete disciplinary action"),
      );
    }
  },
);

const upsertAction = (state: DisciplinaryState, action: DisciplinaryAction) => {
  const index = state.disciplinaryActions.findIndex((item) => item.id === action.id);
  if (index >= 0) {
    state.disciplinaryActions[index] = action;
  } else {
    state.disciplinaryActions = [action, ...state.disciplinaryActions];
  }
};

const disciplinarySlice = createSlice({
  name: "disciplinary",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDisciplinaryActions.pending, (state) => {
        state.isLoadingDisciplinary = true;
        state.error = null;
      })
      .addCase(
        fetchDisciplinaryActions.fulfilled,
        (state, action: PayloadAction<DisciplinaryAction[]>) => {
          state.disciplinaryActions = action.payload;
          state.isLoadingDisciplinary = false;
        },
      )
      .addCase(fetchDisciplinaryActions.rejected, (state, action) => {
        state.isLoadingDisciplinary = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch disciplinary actions";
      })
      .addCase(
        createDisciplinaryAction.fulfilled,
        (state, action: PayloadAction<DisciplinaryAction>) => {
          upsertAction(state, action.payload);
        },
      )
      .addCase(
        updateDisciplinaryAction.fulfilled,
        (state, action: PayloadAction<DisciplinaryAction>) => {
          upsertAction(state, action.payload);
        },
      )
      .addCase(deleteDisciplinaryAction.fulfilled, (state, action: PayloadAction<number>) => {
        state.disciplinaryActions = state.disciplinaryActions.filter(
          (item) => item.id !== action.payload,
        );
      });
  },
});

export const selectDisciplinaryActions = (state: RootState) =>
  state.disciplinary.disciplinaryActions;
export const selectIsLoadingDisciplinary = (state: RootState) =>
  state.disciplinary.isLoadingDisciplinary;
export const selectDisciplinaryError = (state: RootState) => state.disciplinary.error;

export default disciplinarySlice.reducer;
