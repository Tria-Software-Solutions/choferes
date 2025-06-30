import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as RoleService from "../../services/roleService";
import * as RolePermissionService from "../../services/rolePermissionService";
import { Role } from "../../models/Role";
import { RootState } from "../store";

interface RolesState {
  roles: Role[];
  totalCountRoles: number;
  isLoadingRoles: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  totalCountRoles: 0,
  isLoadingRoles: false,
  error: null,
};

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await RoleService.getRoles();
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.roles)) {
        return response.roles;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch roles");
    }
  },
);

export const fetchRoleById = createAsyncThunk(
  "roles/fetchRoleById",
  async (id: number, { rejectWithValue }) => {
    try {
      const role = await RoleService.getRoleById(id);
      return role;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch role by ID",
      );
    }
  },
);

export const fetchRoleByName = createAsyncThunk(
  "roles/fetchRoleByName",
  async (name: string, { rejectWithValue }) => {
    try {
      const role = await RoleService.getRoleByName(name);
      return role;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch role by name",
      );
    }
  },
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (
    {
      newRole,
      newPermissionIds,
    }: { newRole: Omit<Role, "id">; newPermissionIds?: number[] },
    { rejectWithValue },
  ) => {
    try {
      const createdRole = await RoleService.createRole(newRole);
      if (Array.isArray(newPermissionIds) && newPermissionIds.length > 0) {
        await Promise.all(
          newPermissionIds.map((permissionId) =>
            RolePermissionService.createRolePermission({
              roleId: createdRole.id,
              permissionId,
            }),
          ),
        );
      }
      const updatedRole = await RoleService.getRoleById(createdRole.id);
      return updatedRole;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create role");
    }
  },
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async (
    {
      id,
      updatedRole,
      newPermissionIds,
    }: { id: number; updatedRole: Partial<Role>; newPermissionIds?: number[] },
    { rejectWithValue },
  ) => {
    try {
      await RoleService.updateRole(id, updatedRole);

      if (Array.isArray(newPermissionIds)) {
        await RolePermissionService.updateRolePermission(id, newPermissionIds);
      }

      const refreshedRole = await RoleService.getRoleById(id);

      return {
        id,
        refreshedRole,
        newPermissionIds,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update role");
    }
  },
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id: number, { rejectWithValue }) => {
    try {
      await RoleService.deleteRole(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to delete role");
    }
  },
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoadingRoles = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.roles = action.payload;
        state.totalCountRoles = action.payload.length;
        state.isLoadingRoles = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoadingRoles = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch roles";
      })
      .addCase(
        fetchRoleById.fulfilled,
        (state, action: PayloadAction<Role>) => {
          const updatedRoles = state.roles.map((role) =>
            role.id === action.payload.id ? action.payload : role,
          );
          state.roles = updatedRoles;
        },
      )
      .addCase(
        fetchRoleByName.fulfilled,
        (state, action: PayloadAction<Role>) => {
          state.roles = [action.payload];
        },
      )
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        state.roles.push(action.payload);
        state.totalCountRoles += 1;
      })
      .addCase(
        updateRole.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: number;
            refreshedRole: Role;
            newPermissionIds?: number[];
          }>,
        ) => {
          state.roles = state.roles.map((role) =>
            role.id === action.payload.id ? action.payload.refreshedRole : role,
          );
        },
      )
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        state.roles = state.roles.filter((role) => role.id !== action.payload);
        state.totalCountRoles -= 1;
      });
  },
});

export const selectRoles = (state: RootState) => state.roles.roles;
export const selectTotalCountRoles = (state: RootState) =>
  state.roles.totalCountRoles;
export const selectIsLoadingRoles = (state: RootState) =>
  state.roles.isLoadingRoles;
export const selectRolesError = (state: RootState) => state.roles.error;

export default rolesSlice.reducer;
