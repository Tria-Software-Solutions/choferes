import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  useTheme,
  Divider,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  iconSx,
  actionsBox,
  actionsInnerBox,
} from "../AddEmployeeForm/styles";
import { Employee } from '../../../models/Employee';
import SELECTOR_TABLE from '../../../constants/selectorTable.constants';
import { PeriodType } from '../../../components/Table/SelectorTable/helpers/hoursCalculation';
import { WeeklySummary } from '../../../models/WeeklySummary';
import { BiweeklySummary } from '../../../models/BiweeklySummary';
import { MonthlySummary } from '../../../models/MonthlySummary';
import DIALOG from '../../../constants/dialog.constants';

interface WorkedHoursSummaryDialogProps {
  onCancel: () => void;
  employee: Employee | null;
  selectedPeriod: PeriodType;
  getDialogTitle: (employee: Employee | null) => string;
  getPeriodMessage: (period: PeriodType) => string;
  getCurrentHoursDisplay: (
    employee: Employee | null,
    selectedPeriod: PeriodType,
    weekNumber: number,
    biweekNumber: number,
    month: number,
    year: number,
    weeklySummaries: WeeklySummary[],
    biweeklySummaries: BiweeklySummary[],
    monthlySummaries: MonthlySummary[],
  ) => string;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
  isSmallScreen: boolean;
}

const WorkedHoursSummaryDialog: React.FC<WorkedHoursSummaryDialogProps> = ({
  onCancel,
  employee,
  selectedPeriod,
  getDialogTitle,
  getPeriodMessage,
  getCurrentHoursDisplay,
  weekNumber,
  biweekNumber,
  month,
  year,
  weeklySummaries,
  biweeklySummaries,
  monthlySummaries,
  isSmallScreen,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {getDialogTitle(employee)}
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="text.secondary" mb={1}>
            {getPeriodMessage(selectedPeriod)}
          </Typography>
          <Typography
            variant="h3"
            color="primary"
            fontWeight={800}
            mb={2}
          >
            {getCurrentHoursDisplay(
              employee,
              selectedPeriod,
              weekNumber,
              biweekNumber,
              month,
              year,
              weeklySummaries,
              biweeklySummaries,
              monthlySummaries,
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <InfoOutlinedIcon sx={{ ...iconSx(theme), ...infoIconBox(theme) }} />
            </Box>
            <Box>
              <Typography sx={infoTitle(theme)}>
                {SELECTOR_TABLE.INFO}
              </Typography>
              <Typography sx={infoDesc(theme)}>
                {selectedPeriod === 'weekly' && SELECTOR_TABLE.WEEKLY_HOURS_MESSAGE}
                {selectedPeriod === 'biweekly' && SELECTOR_TABLE.BIWEEKLY_HOURS_MESSAGE}
                {selectedPeriod === 'monthly' && SELECTOR_TABLE.MONTHLY_HOURS_MESSAGE}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ mt: 3, mb: 2 }} />
          <Box sx={actionsBox(theme)}>
            <Box sx={actionsInnerBox}>
              <Button
                onClick={onCancel}
                variant="outlined"
                color="inherit"
                fullWidth={isSmallScreen}
                sx={{ minWidth: isSmallScreen ? '100%' : 120, py: 1.5, fontWeight: 600 }}
              >
                {DIALOG.CLOSE}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkedHoursSummaryDialog; 