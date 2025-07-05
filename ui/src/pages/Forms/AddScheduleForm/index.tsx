import React, { useState, useCallback, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  useTheme,
  useMediaQuery,
  InputAdornment,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Schedule } from "../../../models/Schedule";
import FORMS from "../../../constants/forms.constants";
import DAYS_LIST from "../../../constants/days.constants";
import { translateDayOptionsToSpanish } from "../../../utils/string";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  boxRoot,
  gridContainer,
  iconSx,
  formControl,
  daysSelectBox,
  dayChip,
  infoBox,
  infoTitle,
  infoDesc,
  actionsBox,
  clearButton,
  actionsInnerBox,
  cancelButton,
  submitButton,
} from "./styles";

interface AddScheduleFormProps {
  onSubmit: (schedule: Omit<Schedule, "id">) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const AddScheduleForm: React.FC<AddScheduleFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<{
    label: string;
    days: string[];
    hours: number;
    specialSchedule: boolean;
  }>({
    label: "",
    days: [],
    hours: 0,
    specialSchedule: false,
  });

  const [isFormValid, setIsFormValid] = useState(false);

  const validateFields = useCallback((fields: typeof formData) => {
    const regex = {
      text: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/,
    };

    const isLabelValid =
      fields.label.trim().length > 0 && regex.text.test(fields.label);
    const isHoursValid =
      typeof fields.hours === "number" &&
      !isNaN(fields.hours) &&
      fields.hours > 0 &&
      fields.hours <= 24;
    const isDaysValid = fields.days.length > 0;

    return isLabelValid && isHoursValid && isDaysValid;
  }, []);

  useEffect(() => {
    setIsFormValid(validateFields(formData));
  }, [formData, validateFields]);

  const handleSubmit = () => {
    if (isFormValid) {
      const newSchedule: Omit<Schedule, "id"> = {
        label: formData.label,
        days: formData.days,
        hours: formData.hours,
        specialSchedule: formData.specialSchedule,
      };
      onSubmit(newSchedule);
    }
  };

  const handleClearForm = () => {
    setFormData({ label: "", days: [], hours: 0, specialSchedule: false });
  };

  return (
    <Box sx={boxRoot}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {FORMS.ADD_SCHEDULE.DIALOG_CONTENT_TITLE}
        </Typography>
      </Box>
      <Grid container spacing={3} sx={gridContainer}>
        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            label={FORMS.ADD_SCHEDULE.SCHEDULE_LABEL}
            variant="outlined"
            fullWidth
            placeholder={FORMS.ADD_SCHEDULE.SCHEDULE_LABEL_PLACEHOLDER}
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            icon={<CalendarMonthOutlinedIcon sx={iconSx(theme)} />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextfieldComponent
            label={FORMS.ADD_SCHEDULE.SCHEDULE_TIME_LABEL}
            variant="outlined"
            type="number"
            fullWidth
            placeholder={FORMS.ADD_SCHEDULE.SCHEDULE_TIME_PLACEHOLDER}
            value={formData.hours}
            onChange={(e) =>
              setFormData({ ...formData, hours: Number(e.target.value) })
            }
            error={
              formData.hours !== 0 &&
              (isNaN(formData.hours) ||
                formData.hours <= 0 ||
                formData.hours > 24)
            }
            helperText={
              formData.hours !== 0 &&
              (isNaN(formData.hours) ||
                formData.hours <= 0 ||
                formData.hours > 24)
                ? FORMS.HOURS_INVALID
                : ""
            }
            icon={<AccessTimeOutlinedIcon sx={iconSx(theme)} />}
            endAdornment={<Box sx={iconSx(theme)}>horas</Box>}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth sx={formControl(theme)}>
            <InputLabel>{FORMS.DAYS_REQUIRED}</InputLabel>
            <Select
              multiple
              label={FORMS.DAYS_REQUIRED}
              value={formData.days}
              input={
                <OutlinedInput
                  label={FORMS.DAYS_REQUIRED}
                  startAdornment={
                    <InputAdornment position="start">
                      <CalendarMonthOutlinedIcon sx={iconSx(theme)} />
                    </InputAdornment>
                  }
                />
              }
              renderValue={(selected) => (
                <Box sx={daysSelectBox(theme)}>
                  {selected.map((value) => (
                    <Box key={value} sx={dayChip(theme)}>
                      {translateDayOptionsToSpanish(value)}
                    </Box>
                  ))}
                </Box>
              )}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  days: Array.isArray(e.target.value)
                    ? e.target.value
                    : [e.target.value],
                })
              }
              error={formData.days.length === 0}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 320,
                    overflowY: "auto",
                  },
                },
              }}
            >
              {DAYS_LIST.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  <Checkbox checked={formData.days.indexOf(day.value) > -1} />
                  <ListItemText
                    primary={translateDayOptionsToSpanish(day.value)}
                  />
                </MenuItem>
              ))}
            </Select>
            {formData.days.length === 0 && (
              <Typography
                variant="caption"
                sx={{
                  mt: 0.5,
                  display: "block",
                  color: theme.palette.error.main,
                  fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
                }}
              >
                {FORMS.DAYS_REQUIRED}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={infoBox(theme)}>
            <Box
              sx={{ mr: { xs: 1, sm: 2 }, color: theme.palette.warning.main }}
            >
              <WarningAmberOutlinedIcon
                sx={{ color: theme.palette.warning.main, mr: { xs: 1, sm: 2 } }}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.specialSchedule}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialSchedule: e.target.checked,
                      })
                    }
                    color="warning"
                  />
                }
                label={
                  <Box>
                    <Typography sx={infoTitle(theme)}>
                      {FORMS.ADD_SCHEDULE.SPECIAL_LABEL}
                    </Typography>
                    <Typography sx={infoDesc(theme)}>
                      {FORMS.ADD_SCHEDULE.SPECIAL_DESC}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<CloseRoundedIcon />}
              fullWidth={isSmallScreen}
              sx={clearButton}
            >
              Limpiar
            </Button>
            <Box sx={actionsInnerBox}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isLoading}
                  fullWidth={isSmallScreen}
                  sx={cancelButton}
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                startIcon={<AddRoundedIcon />}
                fullWidth={isSmallScreen}
                sx={submitButton}
              >
                Agregar
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddScheduleForm;
