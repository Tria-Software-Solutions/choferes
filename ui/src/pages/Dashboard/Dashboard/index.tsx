import React from "react";
import ManageUsers from "../ManageUsers";
import ManageRoles from "../ManageRoles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import { PAGE_TITLE, DASHBOARD } from "../../../constants/constants";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManagePermissions from "../ManagePermissions";
import {
  dashboardHeaderBoxStyles,
  dashboardTitleBoxStyles,
  dashboardTitleStyles,
  dashboardIconStyles,
  dashboardDividerStyles,
} from "./styles";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import BackupIcon from "@mui/icons-material/Backup";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { deleteAllExceptCoreTables } from "../../../services/backupService";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { getEmployees } from "../../../services/employeeService";
import { getHoursWorked } from "../../../services/hoursWorkedService";
import { getWeeklySummaries } from "../../../services/weeklySummaryService";
import { getSchedules } from "../../../services/scheduleService";
import { fetchAllVehicles } from "../../../services/vehicleService";
import { exportTable, exportFileFormattedDate, buildWeeklySelectorTableExportData, buildVehiclesExportData } from "../../../utils/export";
import { DASHBOARD_BULK_ACTIONS } from '../../../constants/dashboard.constants';

// Dashboard page component for managing users, roles, and permissions
const Dashboard: React.FC = () => {
  // State for accordion expansion
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  // Loading state for export/delete actions
  const [loading, setLoading] = React.useState(false);
  // Controls visibility of the delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { showNotification } = useAppNotifications();

  // Handles accordion expansion
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      if (newExpanded) {
        setExpanded(panel);
      }
    };

  // Export actions for SpeedDial (Excel/PDF)
  const exportActions = [
    { label: DASHBOARD_BULK_ACTIONS.EXPORT_EXCEL, icon: <DescriptionIcon />, type: "excel" },
    { label: DASHBOARD_BULK_ACTIONS.EXPORT_PDF, icon: <PictureAsPdfIcon />, type: "pdf" },
  ];

  // Main export handler: triggers backup export and then shows delete dialog
  const handleExport = async (type: "excel" | "pdf") => {
    setLoading(true);
    try {
      // 1. Fetch all required data
      const employeesResponse = await getEmployees();
      const employees = Array.isArray(employeesResponse)
        ? employeesResponse
        : employeesResponse.employees;
      const hoursWorked = await getHoursWorked();
      const weeklySummaries = await getWeeklySummaries();
      const schedules = await getSchedules();
      const vehicles = await fetchAllVehicles();

      // 2. Prepare SelectorTable weekly data
      const { headers: selectorHeaders, rows: selectorRows } = buildWeeklySelectorTableExportData({
        employees,
        hoursWorked,
        weeklySummaries,
        schedules,
      });
      const selectorFileName = `Backup-roles-${exportFileFormattedDate(new Date())}`;

      // 3. Prepare vehicles data
      const { headers: vehiclesHeaders, rows: vehiclesRows } = buildVehiclesExportData(vehicles);
      const vehiclesFileName = `Backup-reporte-de-vehículos-${exportFileFormattedDate(new Date())}`;

      // 4. Export both files directly (this triggers the save dialog)
      if (type === "excel") {
        exportTable({ data: selectorRows, fileName: selectorFileName, format: 'excel', customHeaders: selectorHeaders });
        exportTable({ data: vehiclesRows, fileName: vehiclesFileName, format: 'excel', customHeaders: vehiclesHeaders });
      } else {
        exportTable({ data: selectorRows, fileName: selectorFileName, format: 'pdf', customHeaders: selectorHeaders });
        exportTable({ data: vehiclesRows, fileName: vehiclesFileName, format: 'pdf', customHeaders: vehiclesHeaders });
      }
      // 5. Show the delete confirmation dialog
      setShowDeleteDialog(true);
    } catch (e) {
      return {};
    } finally {
      setLoading(false);
    }
  };

  // Delete handler: deletes all non-core tables after user confirms
  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteAllExceptCoreTables();
      setShowDeleteDialog(false);
      showNotification(DASHBOARD_BULK_ACTIONS.DELETE_SUCCESS, { severity: 'success', duration: 4000 });
    } catch {
      showNotification(DASHBOARD_BULK_ACTIONS.DELETE_ERROR, { severity: 'error', duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header and SpeedDial for backup/export */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={dashboardHeaderBoxStyles}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          sx={dashboardTitleBoxStyles}
        >
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={dashboardTitleStyles}
          >
            <AdminPanelSettingsIcon
              fontSize={isSmallScreen ? "small" : "large"}
              sx={dashboardIconStyles(theme)}
            />
            {PAGE_TITLE.DASHBOARD}
          </Typography>
          <Divider sx={dashboardDividerStyles(theme)} />
        </Box>
        <Box sx={{ minHeight: 65 }}>
          {/* Backup SpeedDial: triggers export and then delete dialog */}
          <SpeedDialComponent
            actions={exportActions.map((action) => ({
              ...action,
              onClick: () => {
                handleExport(action.type as "excel" | "pdf");
              },
            }))}
            mainIcon={<BackupIcon />}
            openIcon={<CloseRoundedIcon />}
            direction="left"
          />
        </Box>
      </Box>
      {/* Accordions for users, roles, permissions */}
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
      {/* Delete confirmation dialog: shown after export, triggers deleteAllExceptCoreTables */}
      {showDeleteDialog && (
        <DialogComponent
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title={DASHBOARD_BULK_ACTIONS.DELETE_DIALOG_TITLE}
          message={(
            <>
              {DASHBOARD_BULK_ACTIONS.DELETE_DIALOG_MESSAGE.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </>
          )}
          type="delete"
          confirmText={DASHBOARD_BULK_ACTIONS.DELETE_CONFIRM_TEXT}
          cancelText={DASHBOARD_BULK_ACTIONS.DELETE_CANCEL_TEXT}
          loading={loading}
        />
      )}
    </Box>
  );
};

export default Dashboard;
