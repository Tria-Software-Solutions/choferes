import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RolesPage from "./pages/Management/RolesPage";
import EmployeesPage from "./pages/Management/EmployeesPage";
import SchedulesPage from "./pages/Management/SchedulesPage";
import VehiclesPage from "./pages/Management/VehiclesPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Settings from "./pages/Auth/Settings";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import ErrorPage from "./pages/Error";
import SessionExpired from "./pages/SessionExpired";
import AppBarComponent from "./components/AppBar/AppBarComponent";
import SnackbarWrapper from "./components/Snackbar/SnackbarWrapper";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Container } from "@mui/material";
import { APPBAR_MENU, PERMISSIONS, ROUTES } from "./constants/constants";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import wallpaper from "./assets/images/choferesblurred1.webp";

const AppBarWrapper: React.FC = () => {
  const { currentUser, userPermissions } = useAuthContext();
  const { logoutUser } = useAuth();

  const links = [
    {
      label: APPBAR_MENU.ROLES,
      icon: <CalendarMonthRoundedIcon />,
      path: ROUTES.ROLES,
      permission: PERMISSIONS.VIEW_ROLES,
    },
    {
      label: APPBAR_MENU.EMPLOYEES,
      icon: <GroupRoundedIcon />,
      path: ROUTES.EMPLOYEES,
      permission: PERMISSIONS.VIEW_EMPLOYEES,
    },
    {
      label: APPBAR_MENU.SCHEDULES,
      icon: <EditCalendarRoundedIcon />,
      path: ROUTES.SCHEDULES,
      permission: PERMISSIONS.VIEW_SCHEDULES,
    },
    {
      label: APPBAR_MENU.VEHICLES,
      icon: <DirectionsCarIcon />,
      path: ROUTES.VEHICLES,
      permission: PERMISSIONS.VIEW_VEHICLES,
    },
    {
      label: APPBAR_MENU.DASHBOARD,
      icon: <ManageAccountsIcon />,
      path: ROUTES.DASHBOARD,
      permission: PERMISSIONS.VIEW_ADMIN,
    },
  ];

  const permissionsMap = {
    [APPBAR_MENU.ROLES]: PERMISSIONS.VIEW_ROLES,
    [APPBAR_MENU.EMPLOYEES]: PERMISSIONS.VIEW_EMPLOYEES,
    [APPBAR_MENU.SCHEDULES]: PERMISSIONS.VIEW_SCHEDULES,
    [APPBAR_MENU.VEHICLES]: PERMISSIONS.VIEW_VEHICLES,
    [APPBAR_MENU.DASHBOARD]: PERMISSIONS.VIEW_ADMIN,
  };

  const filteredLinks = links.filter((link) => {
    return (userPermissions || []).includes(permissionsMap[link.label]);
  });

  const finalLinks = [
    ...filteredLinks,
    ...(currentUser
      ? [
          {
            label: APPBAR_MENU.LOGOUT,
            icon: <LogoutIcon />,
            path: ROUTES.LOGIN,
            onClick: logoutUser,
          },
        ]
      : []),
  ];

  const userLinks = [
    {
      label: APPBAR_MENU.SETTINGS,
      icon: <SettingsIcon />,
      path: ROUTES.SETTINGS,
    },
  ];

  return (
    <AppBarComponent
      title={APPBAR_MENU.TITLE}
      userLinks={userLinks}
      links={finalLinks}
    />
  );
};

const AppContent: React.FC = () => {
  const { currentUser, userPermissions } = useAuthContext();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/" || location.pathname === "/register";

  const safeUserPermissions = userPermissions || [];

  return (
    <>
      {!isAuthPage && <AppBarWrapper />}
      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          paddingLeft: {
            xs: "16px",
            sm: "24px",
            md: "32px",
            lg: "48px",
            xl: "0",
          },
          paddingRight: {
            xs: "16px",
            sm: "24px",
            md: "32px",
            lg: "48px",
            xl: "0",
          },
          paddingBottom: {
            xs: "16px",
            sm: "24px",
            md: "32px",
            lg: "48px",
            xl: "0",
          },
          backgroundImage: isAuthPage ? `url(${wallpaper})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <Routes>
          <Route
            path="/"
            element={currentUser ? <Navigate to="/roles" /> : <Login />}
          />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/roles"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_ROLES) ? (
                  <RolesPage />
                ) : (
                  <Forbidden />
                )
              }
            />
            <Route
              path="/employees"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_EMPLOYEES) ? (
                  <EmployeesPage />
                ) : (
                  <Forbidden />
                )
              }
            />
            <Route
              path="/schedules"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_SCHEDULES) ? (
                  <SchedulesPage />
                ) : (
                  <Forbidden />
                )
              }
            />
            <Route
              path="/vehicles"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_VEHICLES) ? (
                  <VehiclesPage />
                ) : (
                  <Forbidden />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_ADMIN) ? (
                  <Dashboard />
                ) : (
                  <Forbidden />
                )
              }
            />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/session-expired" element={<SessionExpired />} />
        </Routes>
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <SnackbarWrapper>
            <AppContent />
          </SnackbarWrapper>
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App;
