import React from "react";
import {
  Box,
  Grid,
  Typography,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
import MANAGEMENT from '../../../constants/management.constants';
import { summaryTabPanelAvatarStyles } from '../../Management/RolesPage/styles';
import { infoBox, infoIconBox, infoTitle, infoDesc, iconSx } from '../AddEmployeeForm/styles';
import { actionsBox, actionsInnerBox } from '../AdjustHoursDialog/styles';
import { Employee } from '../../../models/Employee';
import { Theme } from '@mui/material/styles';

interface WorkedHoursSummaryDialogProps {
  onCancel: () => void;
  employee: Employee | null;
  summaryTab: "weekly" | "biweekly" | "monthly" | "overtime";
  setSummaryTab: React.Dispatch<React.SetStateAction<"weekly" | "biweekly" | "monthly" | "overtime">>;
  getEmployeeWeeklyHours: (employeeId: number) => number;
  getEmployeeBiweeklyHours: (employeeId: number) => number;
  getEmployeeMonthlyHours: (employeeId: number) => number;
  getEmployeeOvertime: (employeeId: number) => number;
  currentWeekNumber: number;
  currentBiweekNumber: number;
  currentMonth: number;
  currentYear: number;
  theme: Theme;
}

const WorkedHoursSummaryDialog: React.FC<WorkedHoursSummaryDialogProps> = ({
  onCancel,
  employee,
  summaryTab,
  setSummaryTab,
  getEmployeeWeeklyHours,
  getEmployeeBiweeklyHours,
  getEmployeeMonthlyHours,
  getEmployeeOvertime,
  currentWeekNumber,
  currentBiweekNumber,
  currentMonth,
  currentYear,
  theme,
}) => {
  if (!employee) return null;
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TabContext value={summaryTab}>
            <TabList
              onChange={(_, v) => setSummaryTab(v as typeof summaryTab)}
              variant="fullWidth"
            >
              <Tab label={MANAGEMENT.TAB_WEEKLY} value="weekly" />
              <Tab label={MANAGEMENT.TAB_BIWEEKLY} value="biweekly" />
              <Tab label={MANAGEMENT.TAB_MONTHLY} value="monthly" />
              <Tab label={MANAGEMENT.TAB_OVERTIME} value="overtime" />
            </TabList>
            <Divider sx={{ mb: 2 }} />
            <TabPanel value="weekly">
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={summaryTabPanelAvatarStyles(theme, "success")}> 
                  <BarChartIcon color="success" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {MANAGEMENT.SUMMARY_WEEKLY}
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight={800}>
                    {getEmployeeWeeklyHours(employee.id)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Semana #{currentWeekNumber}
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
            <TabPanel value="biweekly">
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={summaryTabPanelAvatarStyles(theme, "info")}> 
                  <BarChartIcon color="info" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {MANAGEMENT.SUMMARY_BIWEEKLY}
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight={800}>
                    {getEmployeeBiweeklyHours(employee.id)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quincena #{currentBiweekNumber}
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
            <TabPanel value="monthly">
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={summaryTabPanelAvatarStyles(theme, "warning")}> 
                  <BarChartIcon color="warning" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {MANAGEMENT.SUMMARY_MONTHLY}
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight={800}>
                    {getEmployeeMonthlyHours(employee.id)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mes #{currentMonth} / {currentYear}
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
            <TabPanel value="overtime">
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={summaryTabPanelAvatarStyles(theme, "error")}> 
                  <AccessTimeRoundedIcon color="error" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {MANAGEMENT.SUMMARY_OVERTIME}
                  </Typography>
                  <Typography variant="h3" color="error" fontWeight={800}>
                    {getEmployeeOvertime(employee.id)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {MANAGEMENT.SUMMARY_DETAIL_OVERTIME}
                  </Typography>
                </Box>
              </Box>
            </TabPanel>
          </TabContext>
        </Grid>
        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <InfoOutlinedIcon sx={{ ...iconSx(theme), ...infoIconBox(theme) }} />
            </Box>
            <Box>
              <Typography sx={infoTitle(theme)}>
                {MANAGEMENT.SUMMARY_INFO_TITLE}
              </Typography>
              <Typography sx={infoDesc(theme)}>
                {MANAGEMENT.SUMMARY_INFO_DESC}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              onClick={onCancel}
              variant="outlined"
              color="inherit"
              sx={{ minWidth: 120, py: 1.5, fontWeight: 600 }}
            >
              Cerrar
            </Button>
            <Box sx={actionsInnerBox} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkedHoursSummaryDialog; 