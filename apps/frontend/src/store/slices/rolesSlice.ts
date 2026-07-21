import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as RoleService from "../../services/roleService";
import * as RolePermissionService from "../../services/rolePermissionService";
import { Role } from "../../models/Role";
import { RootState } from "../store";

// rolesSlice manages the state and async logic for role data
// Includes fetching, creating, updating, and deleting roles, as well as role permissions
// State: roles array, total count, loading state, error

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

// Fetch all roles from the API
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
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch roles"
      );
    }
  },
);

// Fetch a role by its ID from the API
export const fetchRoleById = createAsyncThunk(
  "roles/fetchRoleById",
  async (id: number, { rejectWithValue }) => {
    try {
      const role = await RoleService.getRoleById(id);
      return role;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch role by ID"
      );
    }
  },
);

// Fetch a role by its name from the API
export const fetchRoleByName = createAsyncThunk(
  "roles/fetchRoleByName",
  async (name: string, { rejectWithValue }) => {
    try {
      const role = await RoleService.getRoleByName(name);
      return role;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch role by name"
      );
    }
  },
);

// Create a new role and assign permissions
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
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create role"
      );
    }
  },
);

// Update a role and its permissions
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
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update role"
      );
    }
  },
);

// Delete a role by its ID
export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id: number, { rejectWithValue }) => {
    try {
      await RoleService.deleteRole(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete role"
      );
    }
  },
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle async actions for roles
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
          // Update a single role in the state by ID
          const updatedRoles = state.roles.map((role) =>
            role.id === action.payload.id ? action.payload : role,
          );
          state.roles = updatedRoles;
        },
      )
      .addCase(
        fetchRoleByName.fulfilled,
        (state, action: PayloadAction<Role>) => {
          // Replace roles array with the fetched role by name
          state.roles = [action.payload];
        },
      )
      .addCase(createRole.fulfilled, (state, action: PayloadAction<Role>) => {
        // Add the newly created role to the state
        state.roles = [...state.roles, action.payload];
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
          // Update a role in the state after editing
          state.roles = state.roles.map((role) =>
            role.id === action.payload.id ? action.payload.refreshedRole : role,
          );
        },
      )
      .addCase(deleteRole.fulfilled, (state, action: PayloadAction<number>) => {
        // Remove a role from the state by ID
        state.roles = state.roles.filter((role) => role.id !== action.payload);
        state.totalCountRoles -= 1;
      });
  },
});

// Selector to get all roles from the state
export const selectRoles = (state: RootState) => state.roles.roles;
// Selector to get the total count of roles
export const selectTotalCountRoles = (state: RootState) =>
  state.roles.totalCountRoles;
// Selector to get the loading state for roles
export const selectIsLoadingRoles = (state: RootState) =>
  state.roles.isLoadingRoles;
// Selector to get the error state for roles
export const selectRolesError = (state: RootState) => state.roles.error;

export default rolesSlice.reducer;
