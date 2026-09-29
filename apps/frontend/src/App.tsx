import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
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
import { Provider, useDispatch } from "react-redux";
import { store, AppDispatch } from "./store/store";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Container, useMediaQuery, useTheme, CircularProgress, Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { APPBAR_MENU, PERMISSIONS, ROUTES } from "./constants/constants";
import NavIcon from "./components/NavIcon/NavIcon.component";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.component";
import ReminderAnnouncer from "./components/ReminderAnnouncer/ReminderAnnouncer.component";
import { normalizeThemeMode, useThemeMode } from "./context/ThemeContext";
import { updateUserSettings } from "./store/slices/userSlice";
import { setScheduleOrder } from "./store/slices/schedulesSlice";
import { getDefaultRoute } from "./utils/defaultRoute";
import { useHasManagementRole } from "./hooks/useHasManagementRole";

const Login = lazy(() => import("./pages/Auth/Login"));
const RolesPage = lazy(() => import("./pages/Management/RolesPage"));
const EmployeesPage = lazy(() => import("./pages/Management/EmployeesPage"));
const EmployeeDetail = lazy(() => import("./pages/EmployeeDetail"));
const SchedulesPage = lazy(() => import("./pages/Management/SchedulesPage"));
const VehiclesPage = lazy(() => import("./pages/Management/VehiclesPage"));
const TasksPage = lazy(() => import("./pages/Tasks"));
const Profile = lazy(() => import("./pages/Auth/Profile"));
const NotFound = lazy(() => import("./pages/ErrorPages/NotFound"));
const Forbidden = lazy(() => import("./pages/ErrorPages/Forbidden"));
const ErrorPage = lazy(() => import("./pages/ErrorPages/Error"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const MyPanel = lazy(() => import("./pages/MyPanel"));
const SessionExpired = lazy(() => import("./pages/ErrorPages/SessionExpired"));

const PageLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <CircularProgress />
  </Box>
);

interface NavLink {
  label: string;
  icon: React.ReactElement;
  path: string;
  permission?: string;
  /** Exclusivo de Gerencia/Administrativo, además del permiso. */
  managementOnly?: boolean;
}

const AppBarWrapper: React.FC = () => {
  const { userPermissions } = useAuthContext();
  const isManagement = useHasManagementRole();
  const { logoutUser } = useAuth();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const links: NavLink[] = [
    {
      label: APPBAR_MENU.MY_PANEL,
      icon: <NavIcon label={APPBAR_MENU.MY_PANEL} />,
      path: ROUTES.MY_PANEL,
      permission: PERMISSIONS.VIEW_MY_PANEL,
    },
    {
      label: APPBAR_MENU.EMPLOYEES,
      icon: <NavIcon label={APPBAR_MENU.EMPLOYEES} />,
      path: ROUTES.EMPLOYEES,
      permission: PERMISSIONS.VIEW_EMPLOYEES,
    },
    {
      label: APPBAR_MENU.SCHEDULES,
      icon: <NavIcon label={APPBAR_MENU.SCHEDULES} />,
      path: ROUTES.SCHEDULES,
      permission: PERMISSIONS.VIEW_SCHEDULES,
    },
    {
      label: APPBAR_MENU.ROLES,
      icon: <NavIcon label={APPBAR_MENU.ROLES} />,
      path: ROUTES.ROLES,
      permission: PERMISSIONS.VIEW_ROLES,
      // La administración de roles es exclusiva de Gerencia/Administrativo.
      managementOnly: true,
    },
    {
      label: APPBAR_MENU.VEHICLES,
      icon: <NavIcon label={APPBAR_MENU.VEHICLES} />,
      path: ROUTES.VEHICLES,
      permission: PERMISSIONS.VIEW_VEHICLES,
    },
    {
      label: APPBAR_MENU.DASHBOARD,
      icon: <NavIcon label={APPBAR_MENU.DASHBOARD} />,
      path: ROUTES.DASHBOARD,
      permission: PERMISSIONS.VIEW_ADMIN,
    },
    {
      label: APPBAR_MENU.TASKS,
      icon: <NavIcon label={APPBAR_MENU.TASKS} />,
      path: ROUTES.TASKS,
      permission: PERMISSIONS.VIEW_TASKS,
    },
    {
      label: APPBAR_MENU.PROFILE,
      icon: <NavIcon label={APPBAR_MENU.PROFILE} />,
      path: ROUTES.PROFILE,
    },
  ];

  const permissionsMap = {
    [APPBAR_MENU.MY_PANEL]: PERMISSIONS.VIEW_MY_PANEL,
    [APPBAR_MENU.EMPLOYEES]: PERMISSIONS.VIEW_EMPLOYEES,
    [APPBAR_MENU.SCHEDULES]: PERMISSIONS.VIEW_SCHEDULES,
    [APPBAR_MENU.ROLES]: PERMISSIONS.VIEW_ROLES,
    [APPBAR_MENU.VEHICLES]: PERMISSIONS.VIEW_VEHICLES,
    [APPBAR_MENU.DASHBOARD]: PERMISSIONS.VIEW_ADMIN,
    [APPBAR_MENU.TASKS]: PERMISSIONS.VIEW_TASKS,
  };

  const filteredLinks = links.filter((link) => {
    // Roles exige rol de gestión además del permiso.
    if (link.managementOnly && !isManagement) return false;
    const requiredPermission = permissionsMap[link.label];
    // Items without a mapped permission (e.g. Configuración) are always visible
    if (!requiredPermission) return true;
    return (
      Array.isArray(userPermissions) &&
      userPermissions.includes(requiredPermission)
    );
  });

  const finalLinks = filteredLinks;

  const userLinks = [
    {
      label: APPBAR_MENU.PROFILE,
      icon: <NavIcon label={APPBAR_MENU.PROFILE} size={20} />,
      path: ROUTES.PROFILE,
    },
    {
      label: APPBAR_MENU.LOGOUT,
      icon: <NavIcon label={APPBAR_MENU.LOGOUT} size={20} />,
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

const AppFooter: React.FC<{ sx?: SxProps<Theme> }> = ({ sx }) => {
  const { colors, borders } = useTheme().tokens;
  return (
    <Box
      component="footer"
      sx={[
        {
          flexShrink: 0,
          textAlign: "center",
          py: 1.25,
          px: 3,
          borderTop: borders.hairline,
          fontSize: "0.65rem",
          letterSpacing: "0.04em",
          color: colors.textMuted,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      Powered by{" "}
      <Box
        component="a"
        href="https://triacr.com"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          fontWeight: 600,
          color: colors.text,
          opacity: 0.7,
          textDecoration: "none",
          "&:hover": { opacity: 1 },
        }}
      >
        Tria
      </Box>
      {"  ·  "}&copy; {new Date().getFullYear()} Choferes de Alquiler
    </Box>
  );
};

const AppContent: React.FC = () => {
  const { currentUser, userPermissions } = useAuthContext();
  const isManagement = useHasManagementRole();
  const location = useLocation();
  const theme = useTheme();

  // List of routes where AppBar should be hidden
  const hideAppBarRoutes = [
    "/",
    "/error",
    "/session-expired",
    "/forbidden",
  ];

  // Helper: known app routes (excluding error/forbidden/notfound/sessionexpired)
  const knownAppRoutes = [
    "/",
    "/roles",
    "/employees",
    "/schedules",
    "/vehicles",
    "/dashboard",
    "/mi-panel",
    "/settings",
    "/profile",
    "/tasks",
  ];

  // Only use wallpaper for login and error pages
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/error" ||
    location.pathname === "/session-expired" ||
    location.pathname === "/forbidden" ||
    location.pathname === "/notfound" ||
    (!knownAppRoutes.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(route + "/"),
    ) &&
      location.pathname !== "/error" &&
      location.pathname !== "/session-expired");

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
      {!isHideAppBar && <AppBarWrapper />}
      {currentUser && <ReminderAnnouncer />}
      <Container
        maxWidth={false}
        disableGutters
        className={isAuthPage ? "full-height" : "content-height-with-appbar"}
        sx={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: 0,
          overflow: "hidden",
          backgroundColor: isAuthPage ? "transparent" : theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route
              path="/"
              element={
                currentUser ? (
                  <Navigate to={getDefaultRoute(safeUserPermissions, isManagement)} />
                ) : (
                  <Login />
                )
              }
            />
                      <Route element={<ProtectedRoute />}>
              <Route
                path="/roles"
                element={
                  isManagement &&
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
                path="/employees/:id"
                element={
                  safeUserPermissions.includes(PERMISSIONS.VIEW_EMPLOYEES) ? (
                    <EmployeeDetail />
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
                path="/tasks"
                element={
                  safeUserPermissions.includes(PERMISSIONS.VIEW_TASKS) ? (
                    <TasksPage />
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
              <Route
                path="/mi-panel"
                element={
                  safeUserPermissions.includes(PERMISSIONS.VIEW_MY_PANEL) ? (
                    <MyPanel />
                  ) : (
                    <Navigate to="/forbidden" replace />
                  )
                }
              />
              <Route path="/settings" element={<Profile />} />
              <Route path="/profile" element={<Navigate to="/settings" replace />} />
            </Route>
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="/session-expired" element={<SessionExpired />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
          {/* Phones/tablets: at the end of the content instead of eating viewport height */}
          {!isHideAppBar && <AppFooter sx={{ display: { xs: "block", md: "none" } }} />}
        </Box>
        {/* Desktop: pinned under the scroll area */}
        {!isHideAppBar && <AppFooter sx={{ display: { xs: "none", md: "block" } }} />}
      </Container>
    </Box>
  );
};

// ─── ThemeSync: synchronizes theme preference between DB and localStorage ───
const ThemeSync: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const { currentUser, setUser } = useAuthContext();
  const dispatch = useDispatch<AppDispatch>();
  const initFromDbDone = useRef(false);
  const lastSyncedMode = useRef<string | null>(null);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const setUserRef = useRef(setUser);
  setUserRef.current = setUser;
  const [syncRetry, setSyncRetry] = useState(0);

  // On user login, sync DB settings → localStorage/context + Redux (one-time).
  // Gates on currentUser.id (not settings truthiness) so it always initializes,
  // even if the user object was set without a settings key.
  useEffect(() => {
    if (currentUser?.id && !initFromDbDone.current) {
      // Sync theme
      const storedTheme = currentUser.settings?.theme;
      const dbTheme = storedTheme ? normalizeThemeMode(storedTheme) : undefined;
      if (dbTheme && dbTheme !== mode) {
        setMode(dbTheme);
      }
      // Sync schedule order to schedules store
      const scheduleOrder = currentUser.settings?.scheduleOrder as number[] | undefined;
      if (scheduleOrder && Array.isArray(scheduleOrder) && scheduleOrder.length > 0) {
        dispatch(setScheduleOrder(scheduleOrder));
      }
      initFromDbDone.current = true;
      lastSyncedMode.current = dbTheme ?? null;
    }
    if (!currentUser) {
      initFromDbDone.current = false;
      lastSyncedMode.current = null;
    }
  }, [currentUser, mode, setMode, dispatch]);

  // On theme change (from anywhere), sync → DB (debounced).
  // lastSyncedMode is only advanced AFTER a successful save, so if the request
  // fails (e.g. the prod server was asleep), we retry (with a cap) until it
  // persists — this prevents the theme from silently reverting on next login.
  useEffect(() => {
    if (currentUser?.id && initFromDbDone.current && mode !== lastSyncedMode.current) {
      // A new sync attempt gets a fresh retry budget (previous mode's failures
      // must not consume the new mode's retries).
      retryCount.current = 0;
      const timer = setTimeout(async () => {
        const user = currentUserRef.current;
        if (!user?.id) return;
        try {
          await dispatch(
            updateUserSettings({ id: user.id, settings: { theme: mode } }),
          ).unwrap();
          lastSyncedMode.current = mode;
          retryCount.current = 0;
          // Keep AuthContext/sessionStorage in sync so the saved theme survives
          // reloads and is picked up by the DB → local sync on next mount.
          setUserRef.current({
            ...user,
            settings: { ...(user.settings || {}), theme: mode },
          });
        } catch {
          // Keep lastSyncedMode stale so the next render re-attempts the sync.
          // Bounded retry (max 5) recovers from a transient failure (server
          // waking up from sleep) without hammering the API indefinitely.
          retryCount.current += 1;
          if (retryCount.current <= 5) {
            if (retryTimer.current) clearTimeout(retryTimer.current);
            retryTimer.current = setTimeout(() => {
              setSyncRetry((v) => v + 1);
            }, 5000);
          }
        }
      }, 300);
      return () => {
        clearTimeout(timer);
        if (retryTimer.current) {
          clearTimeout(retryTimer.current);
          retryTimer.current = null;
        }
      };
    }
  }, [mode, currentUser?.id, dispatch, syncRetry]);

  return null;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeSync />
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
