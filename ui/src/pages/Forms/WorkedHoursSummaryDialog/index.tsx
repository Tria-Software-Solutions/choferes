import React from "react";
import {
  Box,
  Grid,
  Typography,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { Info, BarChart3, Clock } from "lucide-react";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
import MANAGEMENT from '../../../constants/management.constants';
import {
  containerBox,
  tabListSx,
  premiumDivider,
  premiumAvatarStyles,
  titleTypography,
  hoursTypography,
  subtitleTypography,
  infoBox,
  infoIconBox,
  infoIconStyle,
  infoTitle,
  infoDesc,
  actionsBox,
  closeButtonSx,
} from './styles';
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
  getEmployeeWeeklyOvertime: (employeeId: number) => number;
  getEmployeeBiweeklyOvertime: (employeeId: number) => number;
  getEmployeeMonthlyOvertime: (employeeId: number) => number;
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
  getEmployeeWeeklyOvertime,
  getEmployeeBiweeklyOvertime,
  getEmployeeMonthlyOvertime,
  currentWeekNumber,
  currentBiweekNumber,
  currentMonth,
  currentYear,
  theme,
}) => {
  if (!employee) return null;
  return (
    <Box sx={containerBox}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TabContext value={summaryTab}>
            <TabList
              onChange={(_, v) => setSummaryTab(v as typeof summaryTab)}
              variant="scrollable"
              scrollButtons="auto"
              sx={tabListSx}
            >
              <Tab label={MANAGEMENT.TAB_WEEKLY} value="weekly" />
              <Tab label={MANAGEMENT.TAB_BIWEEKLY} value="biweekly" />
              <Tab label={MANAGEMENT.TAB_MONTHLY} value="monthly" />
              <Tab label={MANAGEMENT.TAB_OVERTIME} value="overtime" />
            </TabList>
            <Divider sx={premiumDivider} />
            <TabPanel value="weekly">
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ ...premiumAvatarStyles(theme, "success"), mx: 'auto', mb: 2 }}>
                  <BarChart3 color="#fff" size={32} />
                </Avatar>
                <Typography sx={{ ...titleTypography(theme), mb: 1 }}>
                  {MANAGEMENT.SUMMARY_WEEKLY}
                </Typography>
                <Typography sx={{ ...hoursTypography(theme), fontSize: '3rem' }}>
                  {getEmployeeWeeklyHours(employee.id)}
                </Typography>
                <Typography sx={subtitleTypography(theme)}>
                  Semana #{currentWeekNumber}
                </Typography>
              </Box>
            </TabPanel>
            <TabPanel value="biweekly">
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ ...premiumAvatarStyles(theme, "info"), mx: 'auto', mb: 2 }}>
                  <BarChart3 color="#fff" size={32} />
                </Avatar>
                <Typography sx={{ ...titleTypography(theme), mb: 1 }}>
                  {MANAGEMENT.SUMMARY_BIWEEKLY}
                </Typography>
                <Typography sx={{ ...hoursTypography(theme), fontSize: '3rem' }}>
                  {getEmployeeBiweeklyHours(employee.id)}
                </Typography>
                <Typography sx={subtitleTypography(theme)}>
                  Quincena #{currentBiweekNumber}
                </Typography>
              </Box>
            </TabPanel>
            <TabPanel value="monthly">
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ ...premiumAvatarStyles(theme, "warning"), mx: 'auto', mb: 2 }}>
                  <BarChart3 color="#fff" size={32} />
                </Avatar>
                <Typography sx={{ ...titleTypography(theme), mb: 1 }}>
                  {MANAGEMENT.SUMMARY_MONTHLY}
                </Typography>
                <Typography sx={{ ...hoursTypography(theme), fontSize: '3rem' }}>
                  {getEmployeeMonthlyHours(employee.id)}
                </Typography>
                <Typography sx={subtitleTypography(theme)}>
                  Mes #{currentMonth} / {currentYear}
                </Typography>
              </Box>
            </TabPanel>
            <TabPanel value="overtime">
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ ...premiumAvatarStyles(theme, "error"), mx: 'auto', mb: 2 }}>
                  <Clock color="#fff" size={32} />
                </Avatar>
                <Typography sx={{ ...titleTypography(theme), mb: 1 }}>
                  {MANAGEMENT.SUMMARY_OVERTIME}
                </Typography>
                <Typography sx={{ ...hoursTypography(theme), fontSize: '3rem' }}>
                  {getEmployeeWeeklyOvertime(employee.id)}
                </Typography>
              </Box>
            </TabPanel>
          </TabContext>
        </Grid>
        <Grid item xs={12}>
          <Box sx={infoBox}>
            <Box sx={infoIconBox}>
              <Info style={infoIconStyle} size={20} />
            </Box>
            <Box>
              <Typography sx={infoTitle}>
                {MANAGEMENT.SUMMARY_INFO_TITLE}
              </Typography>
              <Typography sx={infoDesc}>
                {MANAGEMENT.SUMMARY_INFO_DESC}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={actionsBox}>
            <Button
              onClick={onCancel}
              variant="outlined"
              color="inherit"
              sx={closeButtonSx}
            >
              Cerrar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkedHoursSummaryDialog; 
