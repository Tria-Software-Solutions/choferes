import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as RolePermissionService from "../../services/rolePermissionService";
import { RolePermission } from "../../models/RolePermission";
import { RootState } from "../store";

interface RolePermissionsState {
  rolePermissions: RolePermission[];
  totalCountRolePermissions: number;
  isLoadingRolePermissions: boolean;
  error: string | null;
}

const initialState: RolePermissionsState = {
  rolePermissions: [],
  totalCountRolePermissions: 0,
  isLoadingRolePermissions: false,
  error: null,
};

export const fetchRolePermissions = createAsyncThunk(
  "rolePermissions/fetchRolePermissions",
  async (_, { rejectWithValue }) => {
    try {
      const rolePermissions = await RolePermissionService.getRolePermissions();
      return rolePermissions;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch role permissions",
      );
    }
  },
);

export const createRolePermission = createAsyncThunk(
  "rolePermissions/createRolePermission",
  async (
    newRolePermission: Omit<RolePermission, "id">,
    { rejectWithValue },
  ) => {
    try {
      const createdRolePermission =
        await RolePermissionService.createRolePermission(newRolePermission);
      return createdRolePermission;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to create role permission",
      );
    }
  },
);

export const updateRolePermission = createAsyncThunk(
  "rolePermissions/updateRolePermission",
  async (
    args: { roleId: number; permissionIds: number[] },
    { rejectWithValue },
  ) => {
    try {
      await RolePermissionService.updateRolePermission(
        args.roleId,
        args.permissionIds,
      );
      return { roleId: args.roleId, permissionIds: args.permissionIds };
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data || "Failed to update role permission",
      );
    }
  },
);

export const deleteRolePermission = createAsyncThunk(
  "rolePermissions/deleteRolePermission",
  async (id: number, { rejectWithValue }) => {
    try {
      await RolePermissionService.deleteRolePermission(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        error.response?.data || "Failed to delete role permission",
      );
    }
  },
);

const rolePermissionsSlice = createSlice({
  name: "rolePermissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePermissions.pending, (state) => {
        state.isLoadingRolePermissions = true;
        state.error = null;
      })
      .addCase(
        fetchRolePermissions.fulfilled,
        (state, action: PayloadAction<RolePermission[]>) => {
          state.rolePermissions = action.payload;
          state.totalCountRolePermissions = action.payload.length;
          state.isLoadingRolePermissions = false;
        },
      )
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.isLoadingRolePermissions = false;
        state.error =
          (action.payload as string) || "Failed to fetch role permissions";
      })
      .addCase(
        createRolePermission.fulfilled,
        (state, action: PayloadAction<RolePermission>) => {
          state.rolePermissions.push(action.payload);
          state.totalCountRolePermissions += 1;
        },
      )
      .addCase(
        updateRolePermission.fulfilled,
        (
          state,
          action: PayloadAction<{ roleId: number; permissionIds: number[] }>,
        ) => {
          const { roleId, permissionIds } = action.payload;
          const updatedRolePermissions = state.rolePermissions.map(
            (rolePermission) =>
              rolePermission.roleId === roleId
                ? { ...rolePermission, permissionIds }
                : rolePermission,
          );
          state.rolePermissions = updatedRolePermissions;
        },
      )
      .addCase(
        deleteRolePermission.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.rolePermissions = state.rolePermissions.filter(
            (rolePermission) => rolePermission.id !== action.payload,
          );
          state.totalCountRolePermissions -= 1;
        },
      );
  },
});

export const selectRolePermissions = (state: RootState) =>
  state.rolePermissions.rolePermissions;
export const selectTotalCountRolePermissions = (state: RootState) =>
  state.rolePermissions.totalCountRolePermissions;
export const selectIsLoadingRolePermissions = (state: RootState) =>
  state.rolePermissions.isLoadingRolePermissions;
export const selectRolePermissionsError = (state: RootState) =>
  state.rolePermissions.error;

export default rolePermissionsSlice.reducer;
