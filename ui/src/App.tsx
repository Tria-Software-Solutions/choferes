import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container } from "@mui/material";
import Dashboard from "./pages/Dashboard";
import ManageEmployees from "./pages/ManageEmployees";
import AppBarComponent from "./components/AppBar/AppBarComponent";
import { APPBAR_MENU, ROUTES } from "./constants/constants";
import ManageSchedules from "./pages/ManageSchedules";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import ManageVehicles from "./pages/ManageVehicles";

const App: React.FC = () => {
  return (
    <Router>
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
      <Container
        maxWidth="xl"
        disableGutters={false}
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
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<ManageVehicles />} />
          <Route path="/employees" element={<ManageEmployees />} />
          <Route path="/schedules" element={<ManageSchedules />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
