import React from "react";
import { Box, TextField, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTheme } from "@mui/material/styles";

interface DateSelectionProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousDate: () => void;
  onNextDate: () => void;
  onCurrentDate: () => void;
  disabled?: boolean;
  maxDate?: Date;
}

const DateSelectionComponent: React.FC<DateSelectionProps> = ({
  selectedDate,
  onDateChange,
  onPreviousDate,
  onNextDate,
  onCurrentDate,
  disabled = false,
  maxDate,
}) => {
  const theme = useTheme();
  
  const isNextDisabled = disabled || (maxDate && selectedDate >= maxDate);
  const isCurrentDisabled = disabled || (maxDate && selectedDate >= maxDate);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {/* Previous Date Button */}
      <IconButton
        onClick={onPreviousDate}
        disabled={disabled}
        sx={{
          borderRadius: "10px",
          padding: "8px",
          minWidth: "44px",
          minHeight: "44px",
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)"}`,
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&:disabled": {
            backgroundColor: theme.palette.action.disabled,
            color: theme.palette.action.disabled,
            borderColor: theme.palette.action.disabled,
          },
        }}
      >
        <ChevronLeft size={20} />
      </IconButton>

      {/* Date Display Field */}
      <TextField
        value={format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", {
          locale: es,
        })}
        variant="outlined"
        disabled={disabled}
        sx={{
          width: { xs: '100%', sm: '280px' },
          "& .MuiOutlinedInput-root": {
            backgroundColor: theme.palette.background.paper,
            borderRadius: "10px",
            color: theme.palette.text.primary,
            fontSize: "14px",
            fontWeight: 500,
            height: "44px",
            fieldset: {
              borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)",
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
            },
            "&.Mui-disabled": {
              backgroundColor: theme.palette.action.disabled,
              color: theme.palette.text.disabled,
            },
          },
          "& .MuiInputAdornment-root": {
            color: theme.palette.text.secondary,
          },
        }}
        InputProps={{
          startAdornment: (
            <Calendar size={18} style={{ marginRight: "8px", color: theme.palette.text.secondary }} />
          ),
        }}
      />

      {/* Next Date Button */}
      <IconButton
        onClick={onNextDate}
        disabled={isNextDisabled}
        sx={{
          borderRadius: "10px",
          padding: "8px",
          minWidth: "44px",
          minHeight: "44px",
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)"}`,
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&:disabled": {
            backgroundColor: theme.palette.action.disabled,
            color: theme.palette.action.disabled,
            borderColor: theme.palette.action.disabled,
          },
        }}
      >
        <ChevronRight size={20} />
      </IconButton>

      {/* Current Date Button */}
      <IconButton
        onClick={onCurrentDate}
        disabled={isCurrentDisabled}
        sx={{
          borderRadius: "10px",
          padding: "8px",
          minWidth: "44px",
          minHeight: "44px",
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)"}`,
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
          "&:disabled": {
            backgroundColor: theme.palette.action.disabled,
            color: theme.palette.action.disabled,
            borderColor: theme.palette.action.disabled,
          },
        }}
      >
        <RotateCcw size={18} />
      </IconButton>
    </Box>
  );
};

export default DateSelectionComponent;
