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
import CourierServicePage from "./pages/Services/CourierServicePage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Settings from "./pages/Auth/Settings";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import ErrorPage from "./pages/Error";
import SessionExpired from "./pages/SessionExpired";
import AppBarComponent from "./components/AppBar/AppBar.component";
import SnackbarComponent from "./components/Snackbar/Snackbar.component";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Container, useMediaQuery, useTheme } from "@mui/material";
import { APPBAR_MENU, PERMISSIONS, ROUTES } from "./constants/constants";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import wallpaper from "./assets/images/choferesblurred1.webp";

const AppBarWrapper: React.FC = () => {
  const { userPermissions } = useAuthContext();
  const { logoutUser } = useAuth();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const links = [
    {
      label: APPBAR_MENU.ROLES,
      icon: <AssignmentIcon />,
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
      icon: <AdminPanelSettingsIcon />,
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
    return Array.isArray(userPermissions) && userPermissions.includes(permissionsMap[link.label]);
  });

  const finalLinks = filteredLinks;

  const userLinks = [
    {
      label: APPBAR_MENU.SETTINGS,
      icon: <SettingsIcon />,
      path: ROUTES.SETTINGS,
    },
    {
      label: APPBAR_MENU.LOGOUT,
      icon: <LogoutIcon />,
      onClick: logoutUser,
    },
  ];

  return (
    <AppBarComponent
      title={isSmallScreen ? APPBAR_MENU.TITLE_SIMPLIFIED : APPBAR_MENU.TITLE}
      userLinks={userLinks}
      links={finalLinks}
    />
  );
};

const AppContent: React.FC = () => {
  const { currentUser, userPermissions } = useAuthContext();
  const location = useLocation();

  // List of routes where the AppBar should be hidden
  const hideAppBarRoutes = [
    "/",
    "/register",
    "/error",
    "/session-expired",
    "/forbidden"
  ];

  // Only use wallpaper for login and register
  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  // Helper: known app routes (excluding error/forbidden/notfound/sessionexpired)
  const knownAppRoutes = [
    "/",
    "/register",
    "/courier-service",
    "/roles",
    "/employees",
    "/schedules",
    "/vehicles",
    "/dashboard",
    "/settings"
  ];

  // Hide AppBar if on any of the hideAppBarRoutes, or if on a not found route
  const isHideAppBar =
    hideAppBarRoutes.includes(location.pathname) ||
    // NotFound: if current path is not in knownAppRoutes and not a subroute of them
    (!knownAppRoutes.some((route) => location.pathname === route || location.pathname.startsWith(route + "/"))
      && location.pathname !== "/error" && location.pathname !== "/session-expired");

  const safeUserPermissions = userPermissions || [];

  const getDefaultRoute = (userPermissions: string[]) => {
    const routePreferences = [
      { route: ROUTES.ROLES, permission: PERMISSIONS.VIEW_ROLES },
      { route: ROUTES.DASHBOARD, permission: PERMISSIONS.VIEW_ADMIN },
      { route: ROUTES.EMPLOYEES, permission: PERMISSIONS.VIEW_EMPLOYEES },
      { route: ROUTES.SCHEDULES, permission: PERMISSIONS.VIEW_SCHEDULES },
      { route: ROUTES.VEHICLES, permission: PERMISSIONS.VIEW_VEHICLES },
    ];

    for (const { route, permission } of routePreferences) {
      if (Array.isArray(userPermissions) && userPermissions.includes(permission)) {
        return route;
      }
    }

    return ROUTES.ROLES; // fallback to roles if nothing else
  };

  return (
    <>
      {!isHideAppBar && <AppBarWrapper />}
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
            element={
              currentUser ? (
                <Navigate to={getDefaultRoute(safeUserPermissions)} />
              ) : (
                <Login />
              )
            }
          />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/courier-service"
              element={
                safeUserPermissions.includes(
                  PERMISSIONS.VIEW_COURIER_SERVICE,
                ) ? (
                  <CourierServicePage />
                ) : (
                  <Navigate to="/forbidden" replace />
                )
              }
            />
            <Route
              path="/roles"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_ROLES) ? (
                  <RolesPage />
                ) : (
                  <Navigate to="/forbidden" replace />
                )
              }
            />
            <Route
              path="/employees"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_EMPLOYEES) ? (
                  <EmployeesPage />
                ) : (
                  <Navigate to="/forbidden" replace />
                )
              }
            />
            <Route
              path="/schedules"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_SCHEDULES) ? (
                  <SchedulesPage />
                ) : (
                  <Navigate to="/forbidden" replace />
                )
              }
            />
            <Route
              path="/vehicles"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_VEHICLES) ? (
                  <VehiclesPage />
                ) : (
                  <Navigate to="/forbidden" replace />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                safeUserPermissions.includes(PERMISSIONS.VIEW_ADMIN) ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/forbidden" replace />
                )
              }
            />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/forbidden" element={<Forbidden />} />
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
          <SnackbarComponent>
            <AppContent />
          </SnackbarComponent>
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App;
