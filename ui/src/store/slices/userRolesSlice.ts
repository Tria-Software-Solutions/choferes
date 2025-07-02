import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as UserRoleService from "../../services/userRoleService";
import { UserRole } from "../../models/UserRole";
import { RootState } from "../store";

// userRolesSlice manages the state and async logic for user-role assignments
// Includes fetching, creating, updating, and deleting user roles
// State: userRoles array, total count, loading state, error

interface UserRolesState {
  userRoles: UserRole[];
  totalCountUserRoles: number;
  isLoadingUserRoles: boolean;
  error: string | null;
}

const initialState: UserRolesState = {
  userRoles: [],
  totalCountUserRoles: 0,
  isLoadingUserRoles: false,
  error: null,
};

// Fetch all user roles from the API
export const fetchUserRoles = createAsyncThunk(
  "userRoles/fetchUserRoles",
  async (_, { rejectWithValue }) => {
    try {
      const userRoles = await UserRoleService.getUserRoles();
      return userRoles;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user roles",
      );
    }
  },
);

// Fetch user roles by user ID from the API
export const fetchUserRoleByUserId = createAsyncThunk(
  "userRoles/fetchUserRoleByUserId",
  async (userId: number, { rejectWithValue }) => {
    try {
      const userRole = await UserRoleService.getUserRoleByUserId(userId);
      return userRole;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch user role by userId",
      );
    }
  },
);

// Fetch user roles by role ID from the API
export const fetchUserRoleByRoleId = createAsyncThunk(
  "userRoles/fetchUserRoleByRoleId",
  async (roleId: number, { rejectWithValue }) => {
    try {
      const userRole = await UserRoleService.getUserRoleByRoleId(roleId);
      return userRole;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch user role by roleId",
      );
    }
  },
);

// Create a new user role via the API
export const createUserRole = createAsyncThunk(
  "userRoles/createUserRole",
  async (newUserRole: Omit<UserRole, "id">, { rejectWithValue }) => {
    try {
      const createdUserRole = await UserRoleService.createUserRole(newUserRole);
      return createdUserRole;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create user role",
      );
    }
  },
);

// Update a user role by userId and roleId via the API
export const updateUserRole = createAsyncThunk(
  "userRoles/updateUserRole",
  async (args: { userId: number; roleId: number }, { rejectWithValue }) => {
    try {
      await UserRoleService.updateUserRole(args.userId, args.roleId);
      return args;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update user role",
      );
    }
  },
);

// Delete a user role by its ID
export const deleteUserRole = createAsyncThunk(
  "userRoles/deleteUserRole",
  async (id: number, { rejectWithValue }) => {
    try {
      await UserRoleService.deleteUserRole(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete user role",
      );
    }
  },
);

const userRolesSlice = createSlice({
  name: "userRoles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle async actions for user roles
    builder
      .addCase(fetchUserRoles.pending, (state) => {
        state.isLoadingUserRoles = true;
        state.error = null;
      })
      .addCase(
        fetchUserRoles.fulfilled,
        (state, action: PayloadAction<UserRole[]>) => {
          state.userRoles = action.payload;
          state.totalCountUserRoles = action.payload.length;
          state.isLoadingUserRoles = false;
        },
      )
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.isLoadingUserRoles = false;
        state.error =
          (action.payload as string) || "Failed to fetch user roles";
      })
      .addCase(
        fetchUserRoleByUserId.fulfilled,
        (state, action: PayloadAction<UserRole[]>) => {
          // Update user roles in the state by user ID
          state.userRoles = action.payload;
        },
      )
      .addCase(
        fetchUserRoleByRoleId.fulfilled,
        (state, action: PayloadAction<UserRole[]>) => {
          // Update user roles in the state by role ID
          state.userRoles = action.payload;
        },
      )
      .addCase(
        createUserRole.fulfilled,
        (state, action: PayloadAction<UserRole>) => {
          // Add the newly created user role to the state
          state.userRoles.push(action.payload);
          state.totalCountUserRoles += 1;
        },
      )
      .addCase(
        updateUserRole.fulfilled,
        (state, action: PayloadAction<{ userId: number; roleId: number }>) => {
          // Update a user role in the state after editing
          const { userId, roleId } = action.payload;
          const updatedUserRoles = state.userRoles.map((userRole) =>
            userRole.userId === userId ? { ...userRole, roleId } : userRole,
          );
          state.userRoles = updatedUserRoles;
        },
      )
      .addCase(
        deleteUserRole.fulfilled,
        (state, action: PayloadAction<number>) => {
          // Remove a user role from the state by ID
          state.userRoles = state.userRoles.filter(
            (userRole) => userRole.id !== action.payload,
          );
          state.totalCountUserRoles -= 1;
        },
      );
  },
});

// Selector to get all user roles from the state
export const selectUserRoles = (state: RootState) => state.userRoles.userRoles;
// Selector to get the total count of user roles
export const selectTotalCountUserRoles = (state: RootState) =>
  state.userRoles.totalCountUserRoles;
// Selector to get the loading state for user roles
export const selectIsLoadingUserRoles = (state: RootState) =>
  state.userRoles.isLoadingUserRoles;
// Selector to get the error state for user roles
export const selectUserRolesError = (state: RootState) => state.userRoles.error;

export default userRolesSlice.reducer;
