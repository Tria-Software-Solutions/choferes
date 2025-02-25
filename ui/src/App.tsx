import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ManageRoles from "./pages/ManageRoles";
import ManageEmployees from "./pages/ManageEmployees";
import ManageSchedules from "./pages/ManageSchedules";
import ManageVehicles from "./pages/ManageVehicles";
import UserManagement from "./pages/Dashboard/UserManagement";
import RoleManagement from "./pages/Dashboard/RoleManagement";
import PermissionManagement from "./pages/Dashboard/PermissionManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppBarComponent from "./components/AppBar/AppBarComponent";
import { Container } from "@mui/material";
import { APPBAR_MENU, ROUTES } from "./constants/constants";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";

const AppBarWrapper: React.FC = () => {
  return (
    <AppBarComponent
      title={APPBAR_MENU.TITLE}
      links={[
        {
          label: APPBAR_MENU.ROLES,
          icon: <CalendarMonthRoundedIcon />,
          path: ROUTES.HOME,
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
          background: isAuthPage
            ? "linear-gradient(135deg, #1f1f1f 0%, #333333 100%)"
            : "none",
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/userManagement" element={<UserManagement />} />
          <Route path="/roleManagement" element={<RoleManagement />} />
          <Route path="/permissionManagement" element={<PermissionManagement />} />
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
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
