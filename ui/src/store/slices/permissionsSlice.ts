import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as PermissionService from "../../services/permissionService";
import { Permission } from "../../models/Permission";
import { RootState } from "../store";

interface PermissionsState {
  permissions: Permission[];
  totalCountPermissions: number;
  isLoadingPermissions: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  permissions: [],
  totalCountPermissions: 0,
  isLoadingPermissions: false,
  error: null,
};

export const fetchPermissions = createAsyncThunk(
  "permissions/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await PermissionService.getPermissions();
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.permissions)) {
        return response.permissions;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch permissions");
    }
  }
);

export const fetchPermissionById = createAsyncThunk(
  "permissions/fetchPermissionById",
  async (id: number, { rejectWithValue }) => {
    try {
      const permission = await PermissionService.getPermissionById(id);
      return permission;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch permission by ID");
    }
  }
);

export const fetchPermissionsByNames = createAsyncThunk(
  "permissions/fetchPermissionsByNames",
  async (names: string[], { rejectWithValue }) => {
    try {
      const permissions = await PermissionService.getPermissionsByNames(names);
      return permissions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch permissions by names");
    }
  }
);

export const createPermission = createAsyncThunk(
  "permissions/createPermission",
  async (newPermission: Omit<Permission, "id">, { rejectWithValue }) => {
    try {
      const createdPermission = await PermissionService.createPermission(newPermission);
      return createdPermission;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create permission");
    }
  }
);

export const deletePermission = createAsyncThunk(
  "permissions/deletePermission",
  async (id: number, { rejectWithValue }) => {
    try {
      await PermissionService.deletePermission(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to delete permission");
    }
  }
);

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoadingPermissions = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.permissions = action.payload;
        state.totalCountPermissions = action.payload.length;
        state.isLoadingPermissions = false;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoadingPermissions = false;
        state.error = (action.payload as string | null) || "Failed to fetch permissions";
      })
      .addCase(fetchPermissionById.fulfilled, (state, action: PayloadAction<Permission>) => {
        const updatedPermissions = state.permissions.map(permission =>
          permission.id === action.payload.id ? action.payload : permission
        );
        state.permissions = updatedPermissions;
      })
      .addCase(fetchPermissionsByNames.fulfilled, (state, action: PayloadAction<Permission[]>) => {
        state.permissions = action.payload;
      })
      .addCase(createPermission.fulfilled, (state, action: PayloadAction<Permission>) => {
        state.permissions.push(action.payload);
        state.totalCountPermissions += 1;
      })
      .addCase(deletePermission.fulfilled, (state, action: PayloadAction<number>) => {
        state.permissions = state.permissions.filter((permission) => permission.id !== action.payload);
        state.totalCountPermissions -= 1;
      });
  },
});

export const selectPermissions = (state: RootState) => state.permissions.permissions;
export const selectTotalCountPermissions = (state: RootState) => state.permissions.totalCountPermissions;
export const selectIsLoadingPermissions = (state: RootState) => state.permissions.isLoadingPermissions;
export const selectPermissionsError = (state: RootState) => state.permissions.error;

export default permissionsSlice.reducer;
