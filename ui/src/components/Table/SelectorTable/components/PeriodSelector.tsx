import React, { memo } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  type SelectChangeEvent,
  type Theme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { SELECTOR_TABLE } from "../../../../constants/constants";
import { getPeriodSelectorStyles } from "../styles/periodSelector.styles";
import { premiumSelectorMenuProps } from "../SelectorTable.styles";

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
        backgroundColor: `${theme.palette.mode === "dark" ? "#111" : "#000000"} !important`,
        border: "none !important",
        outline: "none !important",
        "& .MuiOutlinedInput-root": {
          border: "none !important",
          outline: "none !important",
        },
        "& .MuiInputBase-root": {
          border: "none !important",
          outline: "none !important",
        },
      }}
    >
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        input={
          <OutlinedInput
            notched={false}
            label="Periodo"
            sx={styles.input}
          />
        }
        sx={{
          ...styles.select,
          "&:hover": {
            outline: "none",
          },
          "&.Mui-focused": {
            outline: "none",
          },
        }}
        MenuProps={{
          ...premiumSelectorMenuProps,
          PaperProps: {
            ...premiumSelectorMenuProps.PaperProps,
            sx: (theme: Theme) => ({
              maxHeight: 320,
              overflowY: "auto",
              backgroundColor: theme.palette.mode === "dark" ? "#1e1e24" : "#ffffff",
              border: "none",
              boxShadow: "none",
              "& .MuiList-root": {
                backgroundColor: theme.palette.mode === "dark" ? "#1e1e24" : "#ffffff",
              },
            }),
          },
        }}
        renderValue={() => renderValue(value)}
      >
        {periodOptions.map(({ value: optionValue, icon: Icon, label }) => (
          <MenuItem 
            key={optionValue} 
            value={optionValue}
            sx={{
              border: "none",
              "&:hover": {
                border: "none",
              },
            }}
          >
            <Icon
              sx={{
                fontSize: 18,
                mr: 1,
                color: "primary.main",
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
