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
            borderRadius: "10px",
            minHeight: "42px",
            position: "relative",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.23)" : "rgba(0,0,0,0.23)"}`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              border: "none !important",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none !important",
            },
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none !important",
            },
            "&.Mui-focused": {
              backgroundColor: theme.palette.action.hover,
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none !important",
            },
            "& input": {
              color: theme.palette.text.primary,
              fontSize: "0.9rem",
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "14px",
              paddingRight: "14px",
              "&::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 0.6,
              },
            },
            "&.MuiInputBase-adornedStart input": {
              paddingLeft: "36px",
              paddingRight: "14px",
            },
            "&.MuiInputBase-adornedEnd input": {
              paddingLeft: "14px",
              paddingRight: "44px",
            },
            "&.MuiInputBase-adornedStart.MuiInputBase-adornedEnd input": {
              paddingLeft: "36px",
              paddingRight: "44px",
            },
            "& .MuiInputAdornment-positionStart": {
              position: "absolute",
              left: "12px",
              marginRight: 0,
              zIndex: 2,
            },
            "& .MuiInputAdornment-positionEnd": {
              position: "absolute",
              right: "12px",
              marginLeft: 0,
              zIndex: 2,
            },
            "&.Mui-disabled": {
              backgroundColor: theme.palette.action.disabled,
              color: theme.palette.text.disabled,
              borderColor: theme.palette.action.disabled,
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
