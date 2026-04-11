import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import AppBarComponent from "./components/AppBar/AppBar.component";
import SnackbarComponent from "./components/Snackbar/Snackbar.component";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Container, useMediaQuery, useTheme, CircularProgress, Box } from "@mui/material";
import { APPBAR_MENU, PERMISSIONS, ROUTES } from "./constants/constants";
import { ClipboardList, Car, Users, CalendarDays, Shield, LogOut, User } from "lucide-react";
import wallpaper from "./assets/images/choferesblurred1.webp";

const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const RolesPage = lazy(() => import("./pages/Management/RolesPage"));
const EmployeesPage = lazy(() => import("./pages/Management/EmployeesPage"));
const SchedulesPage = lazy(() => import("./pages/Management/SchedulesPage"));
const VehiclesPage = lazy(() => import("./pages/Management/VehiclesPage"));
const CourierServicePage = lazy(() => import("./pages/Management/CourierServicePage"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Profile = lazy(() => import("./pages/Auth/Profile"));
const NotFound = lazy(() => import("./pages/ErrorPages/NotFound"));
const Forbidden = lazy(() => import("./pages/ErrorPages/Forbidden"));
const ErrorPage = lazy(() => import("./pages/ErrorPages/Error"));
const SessionExpired = lazy(() => import("./pages/ErrorPages/SessionExpired"));

const PageLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <CircularProgress />
  </Box>
);

const AppBarWrapper: React.FC = () => {
  const { userPermissions } = useAuthContext();
  const { logoutUser } = useAuth();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const links = [
    {
      label: APPBAR_MENU.ROLES,
      icon: <ClipboardList size={22} strokeWidth={1.5} />,
      path: ROUTES.ROLES,
      permission: PERMISSIONS.VIEW_ROLES,
    },
    {
      label: APPBAR_MENU.EMPLOYEES,
      icon: <Users size={22} strokeWidth={1.5} />,
      path: ROUTES.EMPLOYEES,
      permission: PERMISSIONS.VIEW_EMPLOYEES,
    },
    {
      label: APPBAR_MENU.SCHEDULES,
      icon: <CalendarDays size={22} strokeWidth={1.5} />,
      path: ROUTES.SCHEDULES,
      permission: PERMISSIONS.VIEW_SCHEDULES,
    },
    {
      label: APPBAR_MENU.VEHICLES,
      icon: <Car size={22} strokeWidth={1.5} />,
      path: ROUTES.VEHICLES,
      permission: PERMISSIONS.VIEW_VEHICLES,
    },
    {
      label: APPBAR_MENU.DASHBOARD,
      icon: <Shield size={22} strokeWidth={1.5} />,
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
    return (
      Array.isArray(userPermissions) &&
      userPermissions.includes(permissionsMap[link.label])
    );
  });

  const finalLinks = filteredLinks;

  const userLinks = [
    {
      label: APPBAR_MENU.PROFILE,
      icon: <User size={20} />,
      path: ROUTES.PROFILE,
    },
    {
      label: APPBAR_MENU.LOGOUT,
      icon: <LogOut size={20} />,
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
  const theme = useTheme();

  // List of routes where the AppBar should be hidden
  const hideAppBarRoutes = [
    "/",
    "/register",
    "/error",
    "/session-expired",
    "/forbidden",
  ];

  // Only use wallpaper for login and register
  const isAuthPage =
    location.pathname === "/" || location.pathname === "/register";

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
    "/profile",
  ];

  // Hide AppBar if on any of the hideAppBarRoutes, or if on a not found route
  const isHideAppBar =
    hideAppBarRoutes.includes(location.pathname) ||
    // NotFound: if current path is not in knownAppRoutes and not a subroute of them
    (!knownAppRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + "/"),
    ) &&
      location.pathname !== "/error" &&
      location.pathname !== "/session-expired");

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
      if (
        Array.isArray(userPermissions) &&
        userPermissions.includes(permission)
      ) {
        return route;
      }
    }

    return ROUTES.ROLES; // fallback to roles if nothing else
  };

  return (
    <>
      {!isHideAppBar && <AppBarWrapper />}
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          paddingLeft: isAuthPage ? 0 : {
            xs: "8px",
            sm: "12px",
            md: "16px",
            lg: "16px",
            xl: "16px",
          },
          paddingRight: isAuthPage ? 0 : {
            xs: "8px",
            sm: "12px",
            md: "16px",
            lg: "16px",
            xl: "16px",
          },
          paddingBottom: 0,
          minHeight: isAuthPage ? "100vh" : undefined,
          height: isAuthPage ? "100vh" : undefined,
          overflow: isAuthPage ? "hidden" : undefined,
          backgroundColor: isAuthPage ? "transparent" : theme.palette.background.default,
          backgroundImage: isAuthPage ? `url(${wallpaper})` : "none",
          backgroundSize: isAuthPage ? "cover" : undefined,
          backgroundPosition: isAuthPage ? "center" : undefined,
          backgroundRepeat: isAuthPage ? "no-repeat" : undefined,
          backgroundAttachment: isAuthPage ? "fixed" : undefined,
        }}
      >
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/session-expired" element={<SessionExpired />} />
        </Routes>
        </Suspense>
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <SnackbarComponent>
              <AppContent />
            </SnackbarComponent>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
