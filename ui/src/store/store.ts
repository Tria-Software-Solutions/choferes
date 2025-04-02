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
export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    hoursWorked: hoursWorkedReducer,
    permissions: permissionsReducer,
    rolePermissions: rolePermissionsReducer,
    roles: rolesReducer,
    schedules: schedulesReducer,
    userRoles: userRolesReducer,
    users: usersReducer,
    vehicles: vehiclesReducer,
    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
