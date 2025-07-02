import { configureStore } from "@reduxjs/toolkit";
import employeesReducer from "./slices/employeeSlice";
import hoursWorkedReducer from "./slices/hoursWorkedSlice";
import permissionsReducer from "./slices/permissionsSlice";
import rolePermissionsReducer from "./slices/rolePermissionsSlice";
import rolesReducer from "./slices/rolesSlice";
import schedulesReducer from "./slices/schedulesSlice";
import userRolesReducer from "./slices/userRolesSlice";
import usersReducer from "./slices/userSlice";
import vehiclesReducer from "./slices/vehiclesSlice";

// Redux store configuration for the application
// Combines all feature slices and sets up middleware and dev tools
// Exports RootState and AppDispatch types for use throughout the app

// Configure the Redux store with all feature reducers
export const store = configureStore({
  // Combine all feature slices into a single reducer object
  reducer: {
    employees: employeesReducer, // Employee data slice
    hoursWorked: hoursWorkedReducer, // Hours worked data slice
    permissions: permissionsReducer, // Permissions data slice
    rolePermissions: rolePermissionsReducer, // Role-permission assignments slice
    roles: rolesReducer, // Roles data slice
    schedules: schedulesReducer, // Schedules data slice
    userRoles: userRolesReducer, // User-role assignments slice
    users: usersReducer, // Users data slice
    vehicles: vehiclesReducer, // Vehicles data slice
  },
  // Customize middleware for serializability and immutability checks
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist and date fields for serializability
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
          "persist/FLUSH",
        ],
        ignoredPaths: [
          "hoursWorked.entities",
          "employees.entities",
          "users.entities",
        ],
        ignoredActionPaths: [
          "payload.date",
          "payload.createdAt",
          "payload.updatedAt",
        ],
      },
      immutableCheck: {
        // Ignore redux-persist entity paths for immutability
        ignoredPaths: [
          "hoursWorked.entities",
          "employees.entities",
          "users.entities",
        ],
      },
    }),
  // Enable Redux DevTools in non-production environments
  devTools: process.env.NODE_ENV !== "production",
  // No preloaded state by default
  preloadedState: undefined,
});

// RootState type for useSelector and state typing
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch type for useDispatch and thunk typing
export type AppDispatch = typeof store.dispatch;
