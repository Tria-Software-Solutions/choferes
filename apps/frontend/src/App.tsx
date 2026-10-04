import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAppNavigation } from "./hooks/useAppNavigation";
import { useMobileShell } from "./hooks/useMobileShell";
import MobileShell from "./components/MobileShell/MobileShell.component";
import { TAB_BAR_TOTAL_HEIGHT } from "./components/MobileShell/mobileShell.constants";
import AppBarComponent from "./components/AppBar/AppBar.component";
import SnackbarComponent from "./components/Snackbar/Snackbar.component";
import { Provider, useDispatch } from "react-redux";
import { store, AppDispatch } from "./store/store";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Container, useTheme, CircularProgress, Box } from "@mui/material";
import { PERMISSION_CODES, ROUTES } from "./constants/constants";
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
const DocumentsPage = lazy(() => import("./pages/Documents"));
const MyPanel = lazy(() => import("./pages/MyPanel"));
const SessionExpired = lazy(() => import("./pages/ErrorPages/SessionExpired"));

const PageLoader = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <CircularProgress />
  </Box>
);

const AppBarWrapper: React.FC = () => {
  const { links, userLinks } = useAppNavigation();
  return <AppBarComponent userLinks={userLinks} links={links} />;
};

const AppFooter: React.FC = () => {
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

const ShellFrame: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) =>
  enabled ? <MobileShell>{children}</MobileShell> : <>{children}</>;

const AppContent: React.FC = () => {
  const { currentUser, userPermissions } = useAuthContext();
  const isManagement = useHasManagementRole();
  const location = useLocation();
  const theme = useTheme();

  // List of routes where AppBar should be hidden
  const hideAppBarRoutes = [
    ROUTES.LOGIN,
    ROUTES.ERROR,
    ROUTES.SESSION_EXPIRED,
    ROUTES.FORBIDDEN,
  ];

  // Helper: known app routes (excluding error/forbidden/notfound/sessionexpired)
  // Se leen de ROUTES para que renombrar una ruta no pueda quedar a medias: los
  // <Route> de abajo también las consumen.
  const knownAppRoutes = [
    ROUTES.LOGIN,
    ROUTES.ROLES,
    ROUTES.EMPLOYEES,
    ROUTES.SCHEDULES,
    ROUTES.VEHICLES,
    ROUTES.DASHBOARD,
    ROUTES.DOCUMENTS,
    ROUTES.MY_PANEL,
    ROUTES.PROFILE,
    "/profile",
    ROUTES.TASKS,
    ROUTES.LEGACY_MY_PANEL,
  ];

  // Only use wallpaper for login and error pages
  const isKnownAppPath = knownAppRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/"),
  );

  // Only use wallpaper for login and error pages
  const isAuthPage =
    hideAppBarRoutes.includes(location.pathname) ||
    location.pathname === ROUTES.NOT_FOUND ||
    !isKnownAppPath;

  // Hide AppBar if on any of the hideAppBarRoutes, or if on a not found route
  // (path fuera de las rutas conocidas y de las de error).
  const isHideAppBar = isAuthPage;
  // Teléfonos y tablets: interfaz tipo app (barras superior e inferior nativas).
  const isMobileShell = useMobileShell() && !isHideAppBar;

  const safeUserPermissions = userPermissions || [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
      {!isHideAppBar && !isMobileShell && <AppBarWrapper />}
      {currentUser && <ReminderAnnouncer />}
      <ShellFrame enabled={isMobileShell}>
      <Container
        maxWidth={false}
        disableGutters
        className={isAuthPage ? "full-height" : "content-height-with-appbar"}
        sx={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: isMobileShell ? TAB_BAR_TOTAL_HEIGHT : 0,
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
              path={ROUTES.LOGIN}
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
                path={ROUTES.ROLES}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_ROLES) ? (
                    <RolesPage />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.EMPLOYEES}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_EMPLOYEES) ? (
                    <EmployeesPage />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={`${ROUTES.EMPLOYEES}/:id`}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_EMPLOYEES) ? (
                    <EmployeeDetail />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.SCHEDULES}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_SCHEDULES) ? (
                    <SchedulesPage />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.VEHICLES}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_VEHICLES) ? (
                    <VehiclesPage />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.TASKS}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_TASKS) ? (
                    <TasksPage />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_ADMIN) ? (
                    <Dashboard />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.DOCUMENTS}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_DOCUMENTS) ? (
                    <DocumentsPage />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.MY_PANEL}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_MY_PANEL) ? (
                    <MyPanel />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.PROFILE}
                element={
                  safeUserPermissions.includes(PERMISSION_CODES.VIEW_PROFILE) ? (
                    <Profile />
                  ) : (
                    <Navigate to={ROUTES.FORBIDDEN} replace />
                  )
                }
              />
              <Route
                path={ROUTES.LEGACY_MY_PANEL}
                element={<Navigate to={ROUTES.MY_PANEL} replace />}
              />
              <Route
                path={ROUTES.LEGACY_PROFILE}
                element={<Navigate to={ROUTES.PROFILE} replace />}
              />
            </Route>
            <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
            <Route path={ROUTES.ERROR} element={<ErrorPage />} />
            <Route path={ROUTES.SESSION_EXPIRED} element={<SessionExpired />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </Box>
        {/* Escritorio: fijo bajo el área con scroll (en móvil vive en "Más") */}
        {!isHideAppBar && !isMobileShell && <AppFooter />}
      </Container>
      </ShellFrame>
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
