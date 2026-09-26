import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as LicenseService from "../../services/employeeLicenseService";
import { LicenseQuery } from "../../services/employeeLicenseService";
import { EmployeeLicense } from "../../models/EmployeeLicense";
import { RootState } from "../store";
import { getApiErrorMessage } from "../../utils/apiError";

interface LicenseState {
  licenses: EmployeeLicense[];
  isLoadingLicenses: boolean;
  error: string | null;
}

const initialState: LicenseState = {
  licenses: [],
  isLoadingLicenses: false,
  error: null,
};

export const fetchLicenses = createAsyncThunk(
  "licenses/fetchLicenses",
  async (params: LicenseQuery = {}, { rejectWithValue }) => {
    try {
      const response = await LicenseService.getLicenses(params);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to fetch licenses"));
    }
  },
);

export const createLicense = createAsyncThunk(
  "licenses/createLicense",
  async (input: Parameters<typeof LicenseService.createLicense>[0], { rejectWithValue }) => {
    try {
      return await LicenseService.createLicense(input);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to create license"));
    }
  },
);

export const updateLicense = createAsyncThunk(
  "licenses/updateLicense",
  async (
    { id, input }: { id: number; input: Parameters<typeof LicenseService.updateLicense>[1] },
    { rejectWithValue },
  ) => {
    try {
      return await LicenseService.updateLicense(id, input);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to update license"));
    }
  },
);

export const deleteLicense = createAsyncThunk(
  "licenses/deleteLicense",
  async (id: number, { rejectWithValue }) => {
    try {
      return await LicenseService.deleteLicense(id);
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to delete license"));
    }
  },
);

const upsertLicense = (state: LicenseState, license: EmployeeLicense) => {
  const index = state.licenses.findIndex((item) => item.id === license.id);
  if (index >= 0) {
    state.licenses[index] = license;
  } else {
    state.licenses = [license, ...state.licenses];
  }
};

const licenseSlice = createSlice({
  name: "licenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLicenses.pending, (state) => {
        state.isLoadingLicenses = true;
        state.error = null;
      })
      .addCase(fetchLicenses.fulfilled, (state, action: PayloadAction<EmployeeLicense[]>) => {
        state.licenses = action.payload;
        state.isLoadingLicenses = false;
      })
      .addCase(fetchLicenses.rejected, (state, action) => {
        state.isLoadingLicenses = false;
        state.error = (action.payload as string | null) || "Failed to fetch licenses";
      })
      .addCase(createLicense.fulfilled, (state, action: PayloadAction<EmployeeLicense>) => {
        upsertLicense(state, action.payload);
      })
      .addCase(updateLicense.fulfilled, (state, action: PayloadAction<EmployeeLicense>) => {
        upsertLicense(state, action.payload);
      })
      .addCase(deleteLicense.fulfilled, (state, action: PayloadAction<number>) => {
        state.licenses = state.licenses.filter((license) => license.id !== action.payload);
      });
  },
});

export const selectLicenses = (state: RootState) => state.licenses.licenses;
export const selectIsLoadingLicenses = (state: RootState) => state.licenses.isLoadingLicenses;
export const selectLicensesError = (state: RootState) => state.licenses.error;

export default licenseSlice.reducer;
