import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import { Schedule } from "../../../models/Schedule";
import FORMS from "../../../constants/forms.constants";
import { translateDayOptionsToSpanish } from "../../../utils/string";
import { Plus, X, Calendar, AlertTriangle } from "lucide-react";
import TextfieldComponent from "../../../components/Textfield/Textfield.component";
import {
  boxRoot,
  gridContainer,
  iconStyle,
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
  const isDark = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const shortNames: Record<string, string> = {
    monday: 'L', tuesday: 'M', wednesday: 'M', thursday: 'J', friday: 'V', saturday: 'S', sunday: 'D',
  };

  const [label, setLabel] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [specialSchedule, setSpecialSchedule] = useState(false);
  const [dayHours, setDayHours] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState(false);

  const isFormValid =
    label.trim().length > 0 &&
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜëË\s-]+$/.test(label) &&
    days.length > 0 &&
    days.every((day) => {
      const val = dayHours[day];
      return val !== undefined && val !== "" && !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 24;
    });

  // Sync dayHours when days change (add empty entries for new days, remove unselected)
  useEffect(() => {
    setDayHours((prev) => {
      const updated = { ...prev };
      // Remove days no longer selected
      Object.keys(updated).forEach((day) => {
        if (!days.includes(day)) {
          delete updated[day];
        }
      });
      // Add newly selected days with empty value (user must fill them)
      days.forEach((day) => {
        if (!(day in updated)) {
          updated[day] = "";
        }
      });
      return updated;
    });
  }, [days]);

  const handleSubmit = () => {
    setFormTouched(true);
    if (!isFormValid) return;

    const scheduleDays = days.map((day) => ({
      day,
      hours: Number(dayHours[day]),
    }));

    const newSchedule: Omit<Schedule, "id"> & { scheduleDays: Array<{ day: string; hours: number }> } = {
      label,
      days,
      hours: 0,
      specialSchedule,
      scheduleDays,
    };
    onSubmit(newSchedule);
  };

  const handleClearForm = () => {
    setLabel("");
    setDays([]);
    setSpecialSchedule(false);
    setDayHours({});
  };

  return (
    <Box sx={boxRoot}>
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.4 }}
        >
          {FORMS.ADD_SCHEDULE.DIALOG_CONTENT_TITLE}
        </Typography>
      </Box>
      <Grid container spacing={2.5} sx={gridContainer}>
        {/* Name */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Nombre del horario
            </Typography>
            <TextfieldComponent
              placeholder={FORMS.ADD_SCHEDULE.SCHEDULE_LABEL_PLACEHOLDER}
              variant="outlined"
              fullWidth
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              icon={<Calendar size={18} style={iconStyle(theme)} />}
            />
          </Box>
        </Grid>

        {/* Per-day hours - all 7 circles, click to toggle */}
        <Grid item xs={12}>              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Horas por día
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: { xs: 0.6, sm: 0.75 },
                flexWrap: "nowrap",
                overflowX: "auto",
                overflowY: "visible",
                py: 0.5,
                scrollbarWidth: "thin",
                scrollbarColor: isDark ? "rgba(255,255,255,0.15) transparent" : "rgba(0,0,0,0.1) transparent",
                "&::-webkit-scrollbar": { height: "4px" },
                "&::-webkit-scrollbar-thumb": { borderRadius: "4px", backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" },
                "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                alignItems: "flex-start",
              }}
            >
              {daysOfWeek.map((day) => {
                const isActive = days.includes(day);
                const currentVal = dayHours[day] ?? "";
                const hasValue = currentVal !== "";
                const numVal = Number(currentVal);
                const isValid = hasValue && !isNaN(numVal) && numVal > 0 && numVal <= 24;
                const isFilled = hasValue && isValid;
                const dayLabel = translateDayOptionsToSpanish(day);

                return (
                  <Tooltip key={day} title={isActive ? `Quitar ${dayLabel}` : `Agregar ${dayLabel}`} arrow>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.25,
                        minWidth: 32,
                      }}
                    >
                      {/* Day circle - click to toggle */}
                      <Box
                        onClick={() => {
                          if (isActive) {
                            setDays(days.filter((d) => d !== day));
                            const newHours = { ...dayHours };
                            delete newHours[day];
                            setDayHours(newHours);
                          } else {
                            setDays([...days, day]);
                          }
                        }}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          background: isActive
                            ? (t) => t.palette.primary.main
                            : (t) => t.palette.mode === "dark"
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(0,0,0,0.04)",
                          color: isActive ? "#ffffff" : (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            boxShadow: isActive
                              ? "0 4px 12px rgba(99,102,241,0.3)"
                              : (t) => `0 0 0 2px ${t.palette.primary.main}50`,
                          },
                          "&:active": { transform: "scale(0.95)" },
                        }}
                      >
                        {shortNames[day]}
                      </Box>
                      {/* Hours input below (only when active) */}
                      {isActive && (
                        <TextField
                          type="number"
                          placeholder="h"
                          value={currentVal}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            setDayHours((prev) => ({ ...prev, [day]: e.target.value }));
                          }}
                          error={formTouched && !isValid && hasValue}
                          inputProps={{
                            min: 0,
                            max: 24,
                            step: 0.5,
                            style: { textAlign: "center", padding: "2px 0", fontSize: "0.7rem", fontWeight: 700 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "6px",
                              minHeight: "auto",
                              backgroundColor: isFilled
                                ? isDark ? "rgba(99,102,241,0.04)" : "#fff"
                                : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                              "& input": {
                                textAlign: "center",
                                padding: "2px 0",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                width: "28px",
                                color: isFilled ? "primary.main" : theme.palette.text.primary,
                              },
                              "& fieldset": {
                                border: isFilled
                                  ? `1.5px solid ${theme.palette.primary.main}40`
                                  : formTouched && !hasValue
                                    ? `1px solid ${theme.palette.error.main}60`
                                    : "1px solid transparent",
                              },
                              "&:hover fieldset": {
                                borderColor: isFilled ? theme.palette.primary.main : theme.palette.text.disabled,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: theme.palette.primary.main,
                                borderWidth: "2px",
                              },
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
            {days.length === 0 && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: theme.palette.text.disabled,
                  fontStyle: "italic",
                  ml: 0.5,
                }}
              >
                Haz clic en los círculos para seleccionar días y asignar horas
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Special schedule toggle */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: { xs: 1, sm: 1.5 },
              borderRadius: "14px",
              backgroundColor: isDark
                ? "rgba(255,183,77,0.04)"
                : "rgba(255,152,0,0.04)",
              border: `1px solid ${isDark
                ? "rgba(255,183,77,0.08)"
                : "rgba(255,152,0,0.1)"}`,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, #FB8C00, #F57C00)`,
                color: "#fff",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(255,152,0,0.25)",
              }}
            >
              <AlertTriangle size={18} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                    }}
                  >
                    {FORMS.ADD_SCHEDULE.SPECIAL_LABEL}
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                      lineHeight: 1.4,
                      mt: 0.15,
                    }}
                  >
                    {FORMS.ADD_SCHEDULE.SPECIAL_DESC}
                  </Typography>
                </Box>
                <Switch
                  checked={specialSchedule}
                  onChange={(e) => setSpecialSchedule(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FB8C00',
                      '&:hover': {
                        backgroundColor: 'rgba(255,152,0,0.08)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FB8C00',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={actionsBox(theme)}>
            <Button
              variant="outlined"
              onClick={handleClearForm}
              startIcon={<X />}
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
                startIcon={<Plus size={18} />}
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
