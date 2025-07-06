import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  dialogPaperStyles,
  headerBoxStyles,
  iconBoxStyles,
  closeButtonStyles,
  dialogContentStyles,
} from "../../Dialog/Dialog.styles";
import {
  dialogTextFieldStyles,
} from "./SelectorTable.styles";
import {
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
} from '../../../pages/Forms/AddEmployeeForm/styles';
import DIALOG from '../../../constants/dialog.constants';
import { Employee } from '../../../models/Employee';
import SELECTOR_TABLE from '../../../constants/selectorTable.constants';
import { PeriodType } from './helpers/hoursCalculation';
import { WeeklySummary } from '../../../models/WeeklySummary';
import { BiweeklySummary } from '../../../models/BiweeklySummary';
import { MonthlySummary } from '../../../models/MonthlySummary';
import TextfieldComponent from "../../Textfield/Textfield.component";

interface AdjustHoursDialogProps {
  open: boolean;
  onClose: () => void;
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
}

const AdjustHoursDialog: React.FC<AdjustHoursDialogProps> = ({
  open,
  onClose,
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
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: dialogPaperStyles() }}
    >
      <Box sx={headerBoxStyles(theme)}>
        <Box sx={iconBoxStyles(theme)}>
          <AccessTimeRoundedIcon color="primary" />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="inherit">
            {SELECTOR_TABLE.ADJUST_HOURS}
          </Typography>
          <Typography variant="body2" color="inherit">
            {getDialogTitle(employee)}
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <IconButton onClick={onClose} sx={closeButtonStyles}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>
      <DialogContent sx={dialogContentStyles}>
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
              icon={<AccessTimeRoundedIcon color={getTimeAdjustmentIconColor(timeAdjustment)} />}
              sx={dialogTextFieldStyles}
              inputProps={{ min: 0 }}
              error={timeAdjustment < 0}
              helperText={getTimeAdjustmentError(timeAdjustment)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={infoBox(theme)}>
              <Box sx={infoIconBox(theme)}>
                <InfoOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography sx={infoTitle(theme)} component="div">
                  {SELECTOR_TABLE.ADJUSTMENT_INFO}
                </Typography>
                <Typography sx={infoDesc(theme)} variant="body2" color="text.secondary">
                  {SELECTOR_TABLE.ADJUSTMENT_DESCRIPTION}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ mt: 2, gap: 2, flexDirection: isSmallScreen ? 'column' : 'row' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          fullWidth={isSmallScreen}
          sx={{ minWidth: isSmallScreen ? '100%' : 120, py: 1.5, fontWeight: 600 }}
          disabled={loading}
        >
          {DIALOG.CANCEL}
        </Button>
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
      </DialogActions>
    </Dialog>
  );
};

export default AdjustHoursDialog; 