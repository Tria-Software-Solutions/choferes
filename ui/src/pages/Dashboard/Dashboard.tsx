import React, { useState } from "react";
import ManageUsers from "./ManageUsers";
import ManageRoles from "./ManageRoles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PAGE_TITLE } from "../../constants/constants";

const Dashboard = () => {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [showInactive, setShowInactive] = useState(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : expanded);
    };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChangeShowInactive = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowInactive(event.target.checked);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant={isSmallScreen ? "h5" : "h2"} sx={{ flexGrow: 1 }}>
          {isSmallScreen
            ? PAGE_TITLE.DASHBOARD_SIMPLIFIED
            : PAGE_TITLE.DASHBOARD}
        </Typography>
      </Box>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography component="span" fontWeight="bold">
            Usuarios
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Switch
                size={isSmallScreen ? "small" : "medium"}
                color="primary"
                checked={showInactive}
                onChange={handleChangeShowInactive}
              />
            }
            label="Mostrar Inactivos"
            labelPlacement="start"
          />
          <ManageUsers showInactive={showInactive} />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Typography component="span" fontWeight="bold">
            Roles
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ManageRoles />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Dashboard;
