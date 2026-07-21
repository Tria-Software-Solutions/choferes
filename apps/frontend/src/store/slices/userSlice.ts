import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as UserService from "../../services/userService";
import * as UserRoleService from "../../services/userRoleService";
import { User } from "../../models/User";
import { UserRole } from "../../models/UserRole";
import { RootState } from "../store";
import { Roles } from "../../constants/roles";

// userSlice manages the state and async logic for user data
// Includes fetching, creating, updating, and deleting users, as well as user permissions and roles
// State: users array, current user, selected user, permissions, total count, loading state, error
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

// Fetch users from the API, optionally filtered by search term
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params: { search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await UserService.getUsers(params.search);
      if (Array.isArray(response)) {
        return response;
      } else if (
        response &&
        Array.isArray((response as { users: unknown }).users)
      ) {
        return (response as { users: User[] }).users;
      } else {
        return [];
      }
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch users",
      );
    }
  },
);

// Fetch a user by ID from the API
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await UserService.getUserById(id);
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user by ID",
      );
    }
  },
);

// Fetch a user by email from the API
export const fetchUserByEmail = createAsyncThunk(
  "users/fetchUserByEmail",
  async (email: string, { rejectWithValue }) => {
    try {
      return await UserService.getUserByEmail(email);
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch user by email",
      );
    }
  },
);

// Fetch a user by username from the API
export const fetchUserByUsername = createAsyncThunk(
  "users/fetchUserByUsername",
  async (username: string, { rejectWithValue }) => {
    try {
      return await UserService.getUserByUsername(username);
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch user by username",
      );
    }
  },
);

// Fetch user permissions by user ID from the API
export const fetchUserPermissions = createAsyncThunk(
  "users/fetchUserPermissions",
  async (id: number, { rejectWithValue }) => {
    try {
      return await UserService.getUserPermissions(id);
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch user permissions",
      );
    }
  },
);

// Create a new user and assign a role
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
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create user",
      );
    }
  },
);

// Update a user and their role
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
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update user",
      );
    }
  },
);

// Update a user's active status
export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async (
    { id, status }: { id: number; status: boolean },
    { rejectWithValue },
  ) => {
    try {
      const updatedUser = await UserService.updateUserStatus(id, status);
      return updatedUser;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update user status",
      );
    }
  },
);

// Update a user's password
export const updateUserPassword = createAsyncThunk(
  "users/updateUserPassword",
  async (
    { id, password }: { id: number; password: string },
    { rejectWithValue },
  ) => {
    try {
      await UserService.updateUserPassword(id, password);
      return { id, password };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update password",
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
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to update temporal password",
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
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete user",
      );
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
    // Handle async actions for users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.totalCountUsers = action.payload.length;
        state.isLoadingUsers = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.error =
          (action.payload as string | null) || "Failed to fetch users";
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<User>) => {
          // Update a single user in the state by ID
          const updatedUsers = state.users.map((user) =>
            user.id === action.payload.id ? action.payload : user,
          );
          state.users = updatedUsers;
        },
      )
      .addCase(
        fetchUserByEmail.fulfilled,
        (state, action: PayloadAction<User>) => {
          // Replace users array with the fetched user by email
          state.users = [action.payload];
        },
      )
      .addCase(
        fetchUserByUsername.fulfilled,
        (state, action: PayloadAction<User>) => {
          // Replace users array with the fetched user by username
          state.users = [action.payload];
        },
      )
      .addCase(
        fetchUserPermissions.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          // Update permissions for the current user
          state.permissions = action.payload;
        },
      )
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        // Add the newly created user to the state
        state.users = [...state.users, action.payload];
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
          // Update a user in the state after editing
          state.users = state.users.map((user) =>
            user.id === action.payload.id ? action.payload.refreshedUser : user,
          );
        },
      )
      .addCase(
        updateUserStatus.fulfilled,
        (state, action: PayloadAction<User>) => {
          // Update a user in the state with the full updated user object
          state.users = state.users.map((user) =>
            user.id === action.payload.id ? action.payload : user,
          );
        },
      )
      .addCase(
        updateUserPassword.fulfilled,
        (state, action: PayloadAction<{ id: number; password: string }>) => {
          // Update a user's password in the state (not stored for security)
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

// Selector to get the current user from the state
export const selectCurrentUser = (state: RootState) => state.users.currentUser;
// Selector to get all users from the state
export const selectUsers = (state: RootState) => state.users.users;
// Selector to get the selected user from the state
export const selectSelectedUser = (state: RootState) =>
  state.users.selectedUser;
// Selector to get the permissions for the current user
export const selectPermissions = (state: RootState) => state.users.permissions;

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
