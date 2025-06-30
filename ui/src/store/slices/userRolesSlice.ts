import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as UserRoleService from "../../services/userRoleService";
import { UserRole } from "../../models/UserRole";
import { RootState } from "../store";

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
          state.userRoles = action.payload;
        },
      )
      .addCase(
        fetchUserRoleByRoleId.fulfilled,
        (state, action: PayloadAction<UserRole[]>) => {
          state.userRoles = action.payload;
        },
      )
      .addCase(
        createUserRole.fulfilled,
        (state, action: PayloadAction<UserRole>) => {
          state.userRoles.push(action.payload);
          state.totalCountUserRoles += 1;
        },
      )
      .addCase(
        updateUserRole.fulfilled,
        (state, action: PayloadAction<{ userId: number; roleId: number }>) => {
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
          state.userRoles = state.userRoles.filter(
            (userRole) => userRole.id !== action.payload,
          );
          state.totalCountUserRoles -= 1;
        },
      );
  },
});

export const selectUserRoles = (state: RootState) => state.userRoles.userRoles;
export const selectTotalCountUserRoles = (state: RootState) =>
  state.userRoles.totalCountUserRoles;
export const selectIsLoadingUserRoles = (state: RootState) =>
  state.userRoles.isLoadingUserRoles;
export const selectUserRolesError = (state: RootState) => state.userRoles.error;

export default userRolesSlice.reducer;
