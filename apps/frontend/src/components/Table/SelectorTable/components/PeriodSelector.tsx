import React, { memo } from "react";
import { Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { SELECTOR_TABLE } from "../../../../constants/constants";
import SegmentedToggle from "../../../SegmentedToggle/SegmentedToggle.component";

type PeriodType = "weekly" | "biweekly" | "monthly";

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  theme: import("@mui/material").Theme;
}

const periodOptions = [
  {
    value: "weekly" as const,
    icon: <CalendarTodayIcon sx={{ fontSize: 16 }} />,
    label: SELECTOR_TABLE.WEEKLY,
  },
  {
    value: "biweekly" as const,
    icon: <DateRangeIcon sx={{ fontSize: 16 }} />,
    label: SELECTOR_TABLE.BIWEEKLY,
  },
  {
    value: "monthly" as const,
    icon: <CalendarMonthIcon sx={{ fontSize: 16 }} />,
    label: SELECTOR_TABLE.MONTHLY,
  },
];

export const PeriodSelector = memo(function PeriodSelector({
  value,
  onChange,
}: PeriodSelectorProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <SegmentedToggle
        value={value}
        onChange={onChange}
        options={periodOptions}
        size="medium"
        surface="dark"
      />
    </Box>
  );
});