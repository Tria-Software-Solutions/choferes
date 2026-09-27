import { combineReducers, configureStore } from "@reduxjs/toolkit";
import employeesReducer from "./slices/employeeSlice";
import hoursWorkedReducer from "./slices/hoursWorkedSlice";
import paymentsReducer from "./slices/paymentSlice";
import permissionsReducer from "./slices/permissionsSlice";
import rolePermissionsReducer from "./slices/rolePermissionsSlice";
import rolesReducer from "./slices/rolesSlice";
import schedulesReducer from "./slices/schedulesSlice";
import userRolesReducer from "./slices/userRolesSlice";
import usersReducer from "./slices/userSlice";
import vacationsReducer from "./slices/vacationSlice";
import vehiclesReducer from "./slices/vehiclesSlice";
import licensesReducer from "./slices/licenseSlice";
import disciplinaryReducer from "./slices/disciplinarySlice";

// Redux store configuration for the application
// Combines all feature slices and sets up middleware and dev tools
// Exports RootState and AppDispatch types for use throughout the app

// Dispatched on logout so the next user in the same tab never sees the
// previous user's data (employees, payments, users, ...).
export const RESET_STORE = "app/reset";
export const resetStore = () => ({ type: RESET_STORE });

// Combine all feature slices into a single reducer object
const appReducer = combineReducers({
  employees: employeesReducer, // Employee data slice
  hoursWorked: hoursWorkedReducer, // Hours worked data slice
  payments: paymentsReducer, // Biweekly payments (boletas) slice
  permissions: permissionsReducer, // Permissions data slice
  rolePermissions: rolePermissionsReducer, // Role-permission assignments slice
  roles: rolesReducer, // Roles data slice
  schedules: schedulesReducer, // Schedules data slice
  userRoles: userRolesReducer, // User-role assignments slice
  users: usersReducer, // Users data slice
  vacations: vacationsReducer, // Vacation requests slice
  vehicles: vehiclesReducer, // Vehicles data slice
  licenses: licensesReducer, // Employee driver's licenses slice
  disciplinary: disciplinaryReducer, // Disciplinary actions slice
});

const rootReducer: typeof appReducer = (state, action) =>
  appReducer(action.type === RESET_STORE ? undefined : state, action);

// Configure the Redux store with all feature reducers
export const store = configureStore({
  reducer: rootReducer,
  // Customize middleware for serializability and immutability checks
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disabled due to performance warning with large state/actions
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
