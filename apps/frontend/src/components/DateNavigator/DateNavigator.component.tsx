import React from "react";
import { Box, IconButton, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { IconChevronLeft, IconChevronRight, IconRotate } from "@tabler/icons-react";
import PremiumTooltip from "../PremiumTooltip/PremiumTooltip.component";

interface DateNavigatorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onPrevious: () => void;
  onNext: () => void;
  /** Jump back to the current day/week. */
  onReset: () => void;
  maxDate?: Date;
  disableNext?: boolean;
  disableReset?: boolean;
  /** Tooltips / accessible names. */
  labels: { previous: string; next: string; reset: string };
}

// Day/week stepper used by the pages that browse records by date
// (Roles, Vehículos): ‹ [date picker] › ↺, always in that order.
const DateNavigator: React.FC<DateNavigatorProps> = ({
  value,
  onChange,
  onPrevious,
  onNext,
  onReset,
  maxDate,
  disableNext = false,
  disableReset = false,
  labels,
}) => {
  const { colors, borders } = useTheme().tokens;

  const stepButtonSx = {
    width: 32,
    height: 32,
    borderRadius: "8px",
    color: colors.textMuted,
    "&:hover": { color: colors.text, backgroundColor: colors.hover },
    "&.Mui-disabled": { color: colors.disabledText, opacity: 0.5 },
  };

  return (
    <Box
      role="group"
      aria-label="Navegación por fecha"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.25,
        minHeight: 38,
        p: "3px",
        borderRadius: "10px",
        border: borders.paper,
        backgroundColor: colors.hoverSoft,
        width: { xs: "100%", sm: "auto" },
        flexShrink: 0,
      }}
    >
      <PremiumTooltip title={labels.previous}>
        <IconButton size="small" aria-label={labels.previous} onClick={onPrevious} sx={stepButtonSx}>
          <IconChevronLeft size={18} stroke={1.75} />
        </IconButton>
      </PremiumTooltip>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          value={value}
          maxDate={maxDate}
          views={["year", "month", "day"]}
          format="d MMM yyyy"
          slots={{ toolbar: () => null }}
          closeOnSelect
          onChange={onChange}
          slotProps={{
            textField: {
              fullWidth: false,
              required: true,
              variant: "standard",
              sx: {
                flex: { xs: 1, sm: "none" },
                width: { sm: 150 },
                m: 0,
                "& .MuiInputBase-root": {
                  height: 32,
                  px: 1,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: colors.text,
                  backgroundColor: colors.surface,
                  "&:before, &:after": { display: "none" },
                },
                "& input": { textAlign: "center", cursor: "pointer", p: "4px 0" },
                "& .MuiIconButton-root": { color: colors.textMuted, p: 0.5 },
              },
            },
          }}
        />
      </LocalizationProvider>

      <PremiumTooltip title={labels.next}>
        <span>
          <IconButton
            size="small"
            aria-label={labels.next}
            onClick={onNext}
            disabled={disableNext}
            sx={stepButtonSx}
          >
            <IconChevronRight size={18} stroke={1.75} />
          </IconButton>
        </span>
      </PremiumTooltip>

      <PremiumTooltip title={labels.reset}>
        <span>
          <IconButton
            size="small"
            aria-label={labels.reset}
            onClick={onReset}
            disabled={disableReset}
            sx={stepButtonSx}
          >
            <IconRotate size={15} stroke={1.75} />
          </IconButton>
        </span>
      </PremiumTooltip>
    </Box>
  );
};

export default DateNavigator;
