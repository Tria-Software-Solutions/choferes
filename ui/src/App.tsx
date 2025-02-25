import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useUsers } from "./hooks/useUser";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManageRoles from "./pages/ManageRoles";
import ManageEmployees from "./pages/ManageEmployees";
import ManageSchedules from "./pages/ManageSchedules";
import ManageVehicles from "./pages/ManageVehicles";
import UserManagement from "./pages/Dashboard/UserManagement";
import RoleManagement from "./pages/Dashboard/RoleManagement";
import PermissionManagement from "./pages/Dashboard/PermissionManagement";
import AppBarComponent from "./components/AppBar/AppBarComponent";
import { Container } from "@mui/material";
import { APPBAR_MENU, ROUTES } from "./constants/constants";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import wallpaper from "./assets/images/choferes1.webp";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
          label: APPBAR_MENU.VEHICLES,
          icon: <DirectionsCarIcon />,
          path: ROUTES.MANAGE_VEHICLES,
        },
        {
          label: APPBAR_MENU.MANAGE,
          icon: <ManageAccountsRoundedIcon />,
          subLinks: [
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
          ],
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
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user_management" element={<UserManagement />} />
          <Route path="/role_management" element={<RoleManagement />} />
          <Route
            path="/permission_management"
            element={<PermissionManagement />}
          />
          <Route path="/roles" element={<ManageRoles />} />
          <Route path="/vehicles" element={<ManageVehicles />} />
          <Route path="/employees" element={<ManageEmployees />} />
          <Route path="/schedules" element={<ManageSchedules />} />
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
