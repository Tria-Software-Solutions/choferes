import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Grid,
  useTheme,
  DialogActions,
  Button,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  dialogPaperStyles,
  headerBoxStyles,
  iconBoxStyles,
  closeButtonStyles,
  dialogContentStyles,
} from "../../Dialog/Dialog.styles";
import {
  infoBox,
  infoIconBox,
  infoTitle,
  infoDesc,
} from '../../../pages/Forms/AddEmployeeForm/styles';
import { Employee } from '../../../models/Employee';
import SELECTOR_TABLE from '../../../constants/selectorTable.constants';
import { PeriodType } from './helpers/hoursCalculation';
import { WeeklySummary } from '../../../models/WeeklySummary';
import { BiweeklySummary } from '../../../models/BiweeklySummary';
import { MonthlySummary } from '../../../models/MonthlySummary';
import DIALOG from '../../../constants/dialog.constants';

interface WorkedHoursSummaryDialogProps {
  open: boolean;
  onClose: () => void;
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
}

const WorkedHoursSummaryDialog: React.FC<WorkedHoursSummaryDialogProps> = ({
  open,
  onClose,
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
}) => {
  const theme = useTheme();

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
          <InfoOutlinedIcon color="primary" />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="inherit">
            {SELECTOR_TABLE.INFO}
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
          </Grid>
          <Grid item xs={12}>
            <Box sx={infoBox(theme)}>
              <Box sx={infoIconBox(theme)}>
                <InfoOutlinedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography sx={infoTitle(theme)} component="div">
                  Información de Resumen
                </Typography>
                <Typography sx={infoDesc(theme)} variant="body2" color="text.secondary">
                  {selectedPeriod === 'weekly' && SELECTOR_TABLE.WEEKLY_HOURS_MESSAGE}
                  {selectedPeriod === 'biweekly' && SELECTOR_TABLE.BIWEEKLY_HOURS_MESSAGE}
                  {selectedPeriod === 'monthly' && SELECTOR_TABLE.MONTHLY_HOURS_MESSAGE}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ mt: 2, gap: 2, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ minWidth: 120, py: 1.5, fontWeight: 600 }}
        >
          {DIALOG.CLOSE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkedHoursSummaryDialog; 