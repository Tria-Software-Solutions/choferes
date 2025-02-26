import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useUsers } from "./hooks/useUser";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ManageRoles from "./pages/Management/ManageRoles";
import ManageEmployees from "./pages/Management/ManageEmployees";
import ManageSchedules from "./pages/Management/ManageSchedules";
import ManageVehicles from "./pages/Management/ManageVehicles";
import UserManagement from "./pages/Dashboard/UserManagement";
import RoleManagement from "./pages/Dashboard/RoleManagement";
import PermissionManagement from "./pages/Dashboard/PermissionManagement";
import NotFound from "./pages/NotFound";
import AppBarComponent from "./components/AppBar/AppBarComponent";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Container } from "@mui/material";
import { APPBAR_MENU, ROUTES } from "./constants/constants";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import wallpaper from "./assets/images/choferesblurred1.webp";

const AppBarWrapper: React.FC = () => {
  const { currentUser } = useAuth();
  const { handleLogoutUser } = useUsers();
  return (
    <AppBarComponent
      title={APPBAR_MENU.TITLE}
      links={[
        {
          label: APPBAR_MENU.ROLES,
          icon: <CalendarMonthRoundedIcon />,
          path: ROUTES.MANAGE_ROLES,
        },
        {
          label: APPBAR_MENU.EMPLOYEES,
          icon: <GroupRoundedIcon />,
          path: ROUTES.MANAGE_EMPLOYEES,
        },
        {
          label: APPBAR_MENU.SCHEDULES,
          icon: <EditCalendarRoundedIcon />,
          path: ROUTES.MANAGE_SCHEDULES,
        },
        {
          label: APPBAR_MENU.VEHICLES,
          icon: <DirectionsCarIcon />,
          path: ROUTES.MANAGE_VEHICLES,
        },
        ...(currentUser
          ? [
              {
                label: APPBAR_MENU.LOGOUT,
                icon: <LogoutIcon />,
                path: ROUTES.LOGIN,
                onClick: handleLogoutUser,
              },
            ]
          : []),
      ]}
    />
  );
};

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/" || location.pathname === "/register";

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
            <Route path="/dashboard_users" element={<UserManagement />} />
            <Route path="/dashboard_roles" element={<RoleManagement />} />
            <Route
              path="/dashboard_permissions"
              element={<PermissionManagement />}
            />
            <Route path="/roles" element={<ManageRoles />} />
            <Route path="/vehicles" element={<ManageVehicles />} />
            <Route path="/employees" element={<ManageEmployees />} />
            <Route path="/schedules" element={<ManageSchedules />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
