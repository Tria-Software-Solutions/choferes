import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as UserService from "../../services/userService";
import * as UserRoleService from "../../services/userRoleService";
import { User } from "../../models/User";
import { UserRole } from "../../models/UserRole";
import { RootState } from "../store";
import { Roles } from "../../enums/roles";

interface UserState {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  permissions: string[];
  totalCountUsers: number;
  isLoadingUsers: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  permissions: [],
  totalCountUsers: 0,
  isLoadingUsers: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getUsers();
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray((response as any).users)) {
        return (response as any).users;
      } else {
        return [];
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch users");
    }
  },
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await UserService.getUserById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user by ID",
      );
    }
  },
);

export const fetchUserByEmail = createAsyncThunk(
  "users/fetchUserByEmail",
  async (email: string, { rejectWithValue }) => {
    try {
      return await UserService.getUserByEmail(email);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user by email",
      );
    }
  },
);

export const fetchUserByUsername = createAsyncThunk(
  "users/fetchUserByUsername",
  async (username: string, { rejectWithValue }) => {
    try {
      return await UserService.getUserByUsername(username);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user by username",
      );
    }
  },
);

export const fetchUserPermissions = createAsyncThunk(
  "users/fetchUserPermissions",
  async (id: number, { rejectWithValue }) => {
    try {
      return await UserService.getUserPermissions(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user permissions",
      );
    }
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (
    {
      newUser,
      newRoleId,
    }: { newUser: Omit<User, "id" | "temporalPassword">; newRoleId?: number },
    { rejectWithValue },
  ) => {
    try {
      const createdUser = await UserService.createUser(newUser);
      const createdUserRole: Omit<UserRole, "id"> = {
        userId: createdUser.id,
        roleId: newRoleId ? newRoleId : Roles.USER,
      };
      await UserRoleService.createUserRole(createdUserRole);
      const updatedUser = await UserService.getUserById(createdUser.id);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create user");
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    {
      id,
      updatedUser,
      newRoleId,
    }: {
      id: number;
      updatedUser: Partial<Omit<User, "id" | "temporalPassword">>;
      newRoleId?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      await UserService.updateUser(id, updatedUser);

      if (newRoleId !== undefined && typeof newRoleId === "number") {
        await UserRoleService.updateUserRole(id, newRoleId);
      }

      const refreshedUser = await UserService.getUserById(id);

      return {
        id,
        refreshedUser,
        newRoleId,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to update user");
    }
  },
);

export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async (
    { id, status }: { id: number; status: boolean },
    { rejectWithValue },
  ) => {
    try {
      await UserService.updateUserStatus(id, status);
      return { id, status };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update user status",
      );
    }
  },
);

export const updateUserPassword = createAsyncThunk(
  "users/updateUserPassword",
  async (
    { id, password }: { id: number; password: string },
    { rejectWithValue },
  ) => {
    try {
      await UserService.updateUserPassword(id, password);
      return { id, password };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update password",
      );
    }
  },
);

export const updateUserTemporalPassword = createAsyncThunk(
  "users/updateUserTemporalPassword",
  async (
    { id, temporalPassword }: { id: number; temporalPassword: string },
    { rejectWithValue },
  ) => {
    try {
      await UserService.updateUserTemporalPassword(id, temporalPassword);
      return { id, temporalPassword };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update temporal password",
      );
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: number, { rejectWithValue }) => {
    try {
      await UserService.deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to delete user");
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isLoadingUsers = false;
        state.totalCountUsers = action.payload.length;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch users";
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.selectedUser = action.payload;
        },
      )
      .addCase(
        fetchUserByEmail.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.selectedUser = action.payload;
        },
      )
      .addCase(
        fetchUserByUsername.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.selectedUser = action.payload;
        },
      )
      .addCase(
        fetchUserPermissions.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.permissions = action.payload;
        },
      )
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
        state.totalCountUsers += 1;
      })
      .addCase(
        updateUser.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: number;
            refreshedUser: User;
            newRoleId?: number;
          }>,
        ) => {
          state.users = state.users.map((user) =>
            user.id === action.payload.id ? action.payload.refreshedUser : user,
          );
        },
      )
      .addCase(
        updateUserStatus.fulfilled,
        (state, action: PayloadAction<{ id: number; status: boolean }>) => {
          state.users = state.users.map((user) =>
            user.id === action.payload.id
              ? { ...user, isActive: action.payload.status }
              : user,
          );
        },
      )
      .addCase(
        updateUserPassword.fulfilled,
        (state, action: PayloadAction<{ id: number; password: string }>) => {
          state.users = state.users.map((user) =>
            user.id === action.payload.id
              ? { ...user, password: action.payload.password }
              : user,
          );
        },
      )
      .addCase(
        updateUserTemporalPassword.fulfilled,
        (
          state,
          action: PayloadAction<{ id: number; temporalPassword: string }>,
        ) => {
          state.users = state.users.map((user) =>
            user.id === action.payload.id
              ? { ...user, temporalPassword: action.payload.temporalPassword }
              : user,
          );
        },
      )
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.totalCountUsers -= 1;
      });
  },
});

export const selectCurrentUser = (state: RootState) => state.users.currentUser;
export const selectUsers = (state: RootState) => state.users.users;
export const selectSelectedUser = (state: RootState) =>
  state.users.selectedUser;
export const selectPermissions = (state: RootState) => state.users.permissions;

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
