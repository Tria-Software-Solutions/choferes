import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./slices/employeeSlice";
import permissionsReducer from "./slices/permissionsSlice";
import rolePermissionsReducer from "./slices/rolePermissionsSlice";
import rolesReducer from "./slices/rolesSlice";
import scheduleReducer from "./slices/schedulesSlice";
import userRolesReducer from "./slices/userRolesSlice";
import userReducer from "./slices/userSlice";
export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    permissions: permissionsReducer,
    rolePermissions: rolePermissionsReducer,
    roles: rolesReducer,
    schedules: scheduleReducer,
    userRoles: userRolesReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
