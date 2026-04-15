import React, { memo } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  type SelectChangeEvent,
  type Theme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { SELECTOR_TABLE } from "../../../../constants/constants";
import { getPeriodSelectorStyles } from "../styles/periodSelector.styles";

type PeriodType = "weekly" | "biweekly" | "monthly";

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  theme: import("@mui/material").Theme;
}

const periodOptions = [
  { value: "weekly" as const, icon: CalendarTodayIcon, label: SELECTOR_TABLE.WEEKLY },
  { value: "biweekly" as const, icon: DateRangeIcon, label: SELECTOR_TABLE.BIWEEKLY },
  { value: "monthly" as const, icon: CalendarMonthIcon, label: SELECTOR_TABLE.MONTHLY },
];

const renderValue = (selected: PeriodType) => {
  const option = periodOptions.find(o => o.value === selected);
  if (!option) return null;

  const Icon = option.icon;
  return (
    <>
      <Icon
        sx={{
          fontSize: 18,
          mr: 1,
          color: "#fff",
          verticalAlign: "middle",
        }}
      />
      <span
        style={{
          color: "#fff",
          fontSize: "1rem",
          fontWeight: 700,
        }}
      >
        {option.label}
      </span>
    </>
  );
};

export const PeriodSelector = memo(function PeriodSelector({
  value,
  onChange,
  theme,
}: PeriodSelectorProps) {
  const handleChange = (event: SelectChangeEvent<PeriodType>) => {
    onChange(event.target.value as PeriodType);
  };

  const styles = getPeriodSelectorStyles(theme);

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 120,
        margin: 0,
        padding: 0,
        height: "32px",
        backgroundColor: `${theme.palette.mode === "dark" ? "#232323" : "#000000"} !important`,
        border: "none !important",
        outline: "none !important",
        boxShadow: "none !important",
        borderRadius: "0 !important",
        "&::before": {
          display: "none !important",
        },
        "&::after": {
          display: "none !important",
        },
        "& .MuiFormControl-root": {
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
          borderRadius: "0 !important",
        },
        "& .MuiOutlinedInput-root": {
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
          borderRadius: "0 !important",
          "&::before": {
            display: "none !important",
          },
          "&::after": {
            display: "none !important",
          },
        },
        "& .MuiInputBase-root": {
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
          borderRadius: "0 !important",
          "&::before": {
            display: "none !important",
          },
          "&::after": {
            display: "none !important",
          },
        },
        "& .MuiInput-root": {
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
          borderRadius: "0 !important",
          "&::before": {
            display: "none !important",
            borderBottom: "none !important",
          },
          "&::after": {
            display: "none !important",
            borderBottom: "none !important",
          },
        },
      }}
    >
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        variant="standard"
        sx={{
          ...styles.select,
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
          borderRadius: "0 !important",
          appearance: "none !important",
          WebkitAppearance: "none !important",
          MozAppearance: "none !important",
          "&::before": {
            display: "none !important",
            borderBottom: "none !important",
          },
          "&::after": {
            display: "none !important",
            borderBottom: "none !important",
          },
          "&:hover": {
            outline: "none !important",
            border: "none !important",
            boxShadow: "none !important",
            borderRadius: "0 !important",
            "&::before": {
              display: "none !important",
              borderBottom: "none !important",
            },
          },
          "&.Mui-focused": {
            outline: "none !important",
            border: "none !important",
            boxShadow: "none !important",
            borderRadius: "0 !important",
            "&::before": {
              display: "none !important",
              borderBottom: "none !important",
            },
            "&::after": {
              display: "none !important",
              borderBottom: "none !important",
            },
          },
          "& .MuiOutlinedInput-root": {
            border: "none !important",
            outline: "none !important",
            boxShadow: "none !important",
            borderRadius: "0 !important",
          },
          "& fieldset": {
            border: "none !important",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none !important",
          },
          "& .MuiInput-underline:before": {
            borderBottom: "none !important",
          },
          "& .MuiInput-underline:after": {
            borderBottom: "none !important",
          },
          "& .MuiInput-underline:hover:before": {
            borderBottom: "none !important",
          },
          "& .MuiInputBase-root": {
            border: "none !important",
            outline: "none !important",
            boxShadow: "none !important",
            borderRadius: "0 !important",
            "&::before": {
              display: "none !important",
              borderBottom: "none !important",
            },
            "&::after": {
              display: "none !important",
              borderBottom: "none !important",
            },
          },
          "& .MuiInput-root": {
            border: "none !important",
            outline: "none !important",
            boxShadow: "none !important",
            borderRadius: "0 !important",
            "&::before": {
              display: "none !important",
              borderBottom: "none !important",
            },
            "&::after": {
              display: "none !important",
              borderBottom: "none !important",
            },
          },
          "& .MuiSelect-select": {
            border: "none !important",
            outline: "none !important",
            boxShadow: "none !important",
            borderRadius: "0 !important",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: (theme: Theme) => ({
              maxHeight: 320,
              overflowY: "auto",
              backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#000000",
              border: "none !important",
              boxShadow: "none !important",
              outline: "none !important",
              marginTop: 0,
              borderRadius: 0,
              backdropFilter: "none !important",
              WebkitBackdropFilter: "none !important",
              padding: 0,
              "&:before": {
                display: "none !important",
                boxShadow: "none !important",
              },
              "&:after": {
                display: "none !important",
                boxShadow: "none !important",
              },
              "& .MuiList-root": {
                backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#000000",
                padding: 0,
                border: "none !important",
                outline: "none !important",
                boxShadow: "none !important",
                backdropFilter: "none !important",
                WebkitBackdropFilter: "none !important",
                "&:before": {
                  display: "none !important",
                  boxShadow: "none !important",
                },
                "&:after": {
                  display: "none !important",
                  boxShadow: "none !important",
                },
              },
              "& .MuiMenuItem-root": {
                border: "none !important",
                outline: "none !important",
                boxShadow: "none !important",
                "&:before": {
                  display: "none !important",
                  boxShadow: "none !important",
                },
                "&:after": {
                  display: "none !important",
                  boxShadow: "none !important",
                },
              },
            }),
          },
          sx: {
            "& .MuiPopover-paper": {
              boxShadow: "none !important",
              border: "none !important",
            },
          },
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "center",
          },
          marginThreshold: 0,
          disableAutoFocusItem: true,
        }}
        renderValue={() => renderValue(value)}
      >
        {periodOptions.map(({ value: optionValue, icon: Icon, label }) => (
          <MenuItem
            key={optionValue}
            value={optionValue}
            sx={{
              border: "none !important",
              outline: "none !important",
              backgroundColor: "transparent !important",
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
              "&:hover": {
                border: "none !important",
                outline: "none !important",
                backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1) !important" : "rgba(0,0,0,0.1) !important",
              },
            }}
          >
            <Icon
              sx={{
                fontSize: 18,
                mr: 1,
                color: theme.palette.mode === "dark" ? "primary.main" : "#000",
                verticalAlign: "middle",
              }}
            />
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
