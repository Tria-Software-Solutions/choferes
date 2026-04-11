import React from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import { Clock, Info } from "lucide-react";
import {
  dialogTextFieldStyles,
  actionsInnerBox,
  actionsBox,
} from "./styles";
import {
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  iconStyle,
} from "../AddEmployeeForm/styles";
import DIALOG from '../../../constants/dialog.constants';
import { Employee } from '../../../models/Employee';
import SELECTOR_TABLE from '../../../constants/selectorTable.constants';
import { PeriodType } from '../../../components/Table/SelectorTable/helpers/hoursCalculation';
import { WeeklySummary } from '../../../models/WeeklySummary';
import { BiweeklySummary } from '../../../models/BiweeklySummary';
import { MonthlySummary } from '../../../models/MonthlySummary';
import TextfieldComponent from "../../../components/Textfield/Textfield.component";

interface AdjustHoursDialogProps {
  onCancel: () => void;
  employee: Employee | null;
  selectedPeriod: PeriodType;
  timeAdjustment: number;
  setTimeAdjustment: (value: number) => void;
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
  getTimeAdjustmentError: (value: number) => string;
  getTimeAdjustmentIconColor: (value: number) => 'error' | 'primary';
  handleAdjustTime: (employeeId: number, condition: 'add' | 'subtract', timeAdjustment: number) => void;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
  loading?: boolean;
  isSmallScreen: boolean;
}

const AdjustHoursDialog: React.FC<AdjustHoursDialogProps> = ({
  onCancel,
  employee,
  selectedPeriod,
  timeAdjustment,
  setTimeAdjustment,
  getDialogTitle,
  getPeriodMessage,
  getCurrentHoursDisplay,
  getTimeAdjustmentError,
  getTimeAdjustmentIconColor,
  handleAdjustTime,
  weekNumber,
  biweekNumber,
  month,
  year,
  weeklySummaries,
  biweeklySummaries,
  monthlySummaries,
  loading = false,
  isSmallScreen,
}) => {
  const theme = useTheme();

  return (
    <>
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
          <TextfieldComponent
            label={SELECTOR_TABLE.HOURS_TO_ADJUST}
            type="number"
            placeholder="0"
            value={timeAdjustment}
            onChange={(e) => {
              const value = Number(e.target.value);
              setTimeAdjustment(value < 0 ? 0 : value);
            }}
            icon={<Clock color={getTimeAdjustmentIconColor(timeAdjustment)} />}
            sx={dialogTextFieldStyles}
            inputProps={{ min: 0 }}
            error={timeAdjustment < 0}
            helperText={getTimeAdjustmentError(timeAdjustment)}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box sx={infoIconBox(theme)}>
              <Info style={iconStyle} />
            </Box>
            <Box>
              <Typography sx={infoTitle(theme)}>
                {SELECTOR_TABLE.ADJUSTMENT_INFO}
              </Typography>
              <Typography sx={infoDesc(theme)}>
                {SELECTOR_TABLE.ADJUSTMENT_DESCRIPTION}
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
              sx={{ minWidth: isSmallScreen ? '100%' : 120, py: 1.5, fontWeight: 600 }}
              disabled={loading}
            >
              {DIALOG.CANCEL}
            </Button>
            <Box sx={actionsInnerBox}>
              <Button
                onClick={() => employee && handleAdjustTime(employee.id, 'add', timeAdjustment)}
                variant="contained"
                color="success"
                fullWidth={isSmallScreen}
                sx={{ minWidth: isSmallScreen ? '100%' : 120, py: 1.5, fontWeight: 600 }}
                disabled={timeAdjustment <= 0 || loading}
              >
                {SELECTOR_TABLE.ADD}
              </Button>
              <Button
                onClick={() => employee && handleAdjustTime(employee.id, 'subtract', timeAdjustment)}
                variant="contained"
                color="error"
                fullWidth={isSmallScreen}
                sx={{ minWidth: isSmallScreen ? '100%' : 120, py: 1.5, fontWeight: 600 }}
                disabled={timeAdjustment <= 0 || loading}
              >
                {SELECTOR_TABLE.SUBTRACT}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default AdjustHoursDialog; 