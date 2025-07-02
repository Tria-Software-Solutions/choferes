import React from "react";
import ManageUsers from "./ManageUsers";
import ManageRoles from "./ManageRoles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PAGE_TITLE, DASHBOARD } from "../../constants/constants";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ManagePermissions from "./ManagePermissions";

// Dashboard page component for managing users, roles, and permissions
const Dashboard: React.FC = () => {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      if (newExpanded) {
        setExpanded(panel);
      }
    };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box display="flex" alignItems="center">
          <ManageAccountsIcon fontSize={isSmallScreen ? "small" : "large"} />
          <Box sx={{ ml: 1 }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={{ flexGrow: 1 }}
            >
              {isSmallScreen
                ? PAGE_TITLE.DASHBOARD_SIMPLIFIED
                : PAGE_TITLE.DASHBOARD}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography component="span" fontWeight="bold">
            {DASHBOARD.USERS}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {expanded === "panel1" && <ManageUsers isExpanded />}
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Typography component="span" fontWeight="bold">
            {DASHBOARD.ROLES}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {expanded === "panel2" && <ManageRoles isExpanded />}
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
      >
        <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
          <Typography component="span" fontWeight="bold">
            {DASHBOARD.PERMISSIONS}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {expanded === "panel3" && <ManagePermissions />}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Dashboard;
