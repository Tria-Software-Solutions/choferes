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
import RolesPage from "./pages/Management/RolesPage";
import EmployeesPage from "./pages/Management/EmployeesPage";
import SchedulesPage from "./pages/Management/SchedulesPage";
import VehiclesPage from "./pages/Management/VehiclesPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import NotFound from "./pages/NotFound";
import AppBarComponent from "./components/AppBar/AppBarComponent";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Container } from "@mui/material";
import { APPBAR_MENU, PERMISSIONS, ROUTES } from "./constants/constants";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LogoutIcon from "@mui/icons-material/Logout";
import wallpaper from "./assets/images/choferesblurred1.webp";

const AppBarWrapper: React.FC = () => {
  const { currentUser, userPermissions } = useAuth();
  const { logoutUser } = useUsers();

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

  return <AppBarComponent title={APPBAR_MENU.TITLE} links={finalLinks} />;
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
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
