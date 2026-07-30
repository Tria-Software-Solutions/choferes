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
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
  iconStyle,
  formControl,
} from "./styles";
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              {getPeriodMessage(selectedPeriod)}
            </Typography>
            <Typography
              variant="h2"
              color="primary"
              fontWeight={800}
              sx={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}
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
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 280 }}>
              <TextfieldComponent
                type="number"
                placeholder={SELECTOR_TABLE.HOURS_TO_ADJUST}
                value={timeAdjustment}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Remove leading zero if user types something else
                  let processedValue = inputValue;
                  if (inputValue.startsWith('0') && inputValue.length > 1) {
                    processedValue = inputValue.replace(/^0+/, '');
                  }
                  const value = Number(processedValue);
                  setTimeAdjustment(value < 0 ? 0 : value);
                }}
                icon={<Clock color={getTimeAdjustmentIconColor(timeAdjustment)} />}
                sx={{ ...dialogTextFieldStyles, ...formControl(theme), width: '100%' }}
                inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '1.1rem' } }}
                error={timeAdjustment < 0}
                helperText={getTimeAdjustmentError(timeAdjustment)}
              />
            </Box>
          </Box>
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
              sx={{
                minWidth: isSmallScreen ? '100%' : 120,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                letterSpacing: "-0.01em",
                borderRadius: "12px",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                '&:hover': {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                },
                '&:active': {
                  transform: "translateY(0)",
                },
                '&.Mui-disabled': {
                  opacity: 0.6,
                  transform: "none",
                },
              }}
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
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  borderRadius: "12px",
                  minHeight: "48px",
                  px: 3,
                  boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(16,185,129,0.35)",
                  },
                  '&:active': {
                    transform: "translateY(0)",
                  },
                  '&.Mui-disabled': {
                    boxShadow: "none",
                    transform: "none",
                    opacity: 0.6,
                  },
                }}
                disabled={timeAdjustment <= 0 || loading}
              >
                {SELECTOR_TABLE.ADD}
              </Button>
              <Button
                onClick={() => employee && handleAdjustTime(employee.id, 'subtract', timeAdjustment)}
                variant="contained"
                color="error"
                fullWidth={isSmallScreen}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textTransform: "none",
                  letterSpacing: "-0.01em",
                  borderRadius: "12px",
                  minHeight: "48px",
                  px: 3,
                  boxShadow: "0 4px 14px rgba(239,68,68,0.25)",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(239,68,68,0.35)",
                  },
                  '&:active': {
                    transform: "translateY(0)",
                  },
                  '&.Mui-disabled': {
                    boxShadow: "none",
                    transform: "none",
                    opacity: 0.6,
                  },
                }}
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