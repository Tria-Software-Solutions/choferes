import React, { memo } from "react";
import {
  Box,
  Typography,
  TableCell,
  TableRow,
  TableSortLabel,
  useTheme,
} from "@mui/material";
import { Users, CalendarDays } from "lucide-react";
import type { DayEntry } from "../../../../utils/dates";
import { SELECTOR_TABLE } from "../../../../constants/constants";
import { PeriodSelector } from "./PeriodSelector";
import { translateDayToAbrevSpanish } from "../../../../utils/string";
import { formatHeaderDate } from "../../../../utils/dates";
import { EnglishDayOfWeek } from "../../../../utils/dayAbreviations";
import { PERMISSIONS } from "../../../../constants/constants";
import type { PeriodType } from "../helpers/hoursCalculation";
import { getTableHeaderStyles } from "../styles/tableHeader.styles";
import SegmentedToggle from "../../../SegmentedToggle/SegmentedToggle.component";

interface TableHeaderProps {
  viewMode: "employee" | "schedule";
  onToggleViewMode: () => void;
  onSort: () => void;
  orderDirection: "asc" | "desc";
  currentWeek: DayEntry[];
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  multiplePeriods: {
    weekNumbers: Array<{ weekNumber: number; year: number }>;
    biweekNumbers: Array<{ biweekNumber: number; year: number }>;
    months: Array<{ month: number; year: number }>;
  };
  permissions?: string[];
  isSmallScreen: boolean;
}

const renderPeriodHeader = (
  selectedPeriod: PeriodType,
  weekNumber: number,
  biweekNumber: number,
  month: number,
  multiplePeriods: TableHeaderProps["multiplePeriods"]
): string => {
  if (selectedPeriod === "weekly") {
    return multiplePeriods.weekNumbers.length > 1
      ? `${SELECTOR_TABLE.WEEKS} ${multiplePeriods.weekNumbers[1]?.weekNumber} / ${multiplePeriods.weekNumbers[0]?.weekNumber}`
      : `${SELECTOR_TABLE.WEEK} ${weekNumber}`;
  } else if (selectedPeriod === "biweekly") {
    return multiplePeriods.biweekNumbers.length > 1
      ? `${SELECTOR_TABLE.BIWEEKS} ${multiplePeriods.biweekNumbers[0]?.biweekNumber} / ${multiplePeriods.biweekNumbers[1]?.biweekNumber}`
      : `${SELECTOR_TABLE.BIWEEK} ${biweekNumber}`;
  } else {
    const getMonthName = (m: number) =>
      new Date(2024, m - 1, 1).toLocaleDateString("es-ES", { month: "long" });
    return multiplePeriods.months.length > 1
      ? `${getMonthName(multiplePeriods.months[0]?.month)} / ${getMonthName(multiplePeriods.months[1]?.month)}`
      : getMonthName(month);
  }
};

export const TableHeaderTop = memo(function TableHeaderTop({
  viewMode,
  onToggleViewMode,
  onSort,
  orderDirection,
  currentWeek,
  selectedPeriod,
  onPeriodChange,
  weekNumber,
  biweekNumber,
  month,
  year,
  multiplePeriods,
  permissions,
  isSmallScreen,
}: TableHeaderProps) {
  const theme = useTheme();
  const styles = getTableHeaderStyles(theme, isSmallScreen);
  const showHoursColumn = permissions?.includes(PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS);

  // Check if date is today
  const isToday = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return today.getTime() === targetDate.getTime();
  };

  return (
    <>
      {/* Top header bar */}
      <Box sx={styles.topHeader}>
        <Box sx={styles.headerFlexContainer}>
          {/* Left: View toggle */}
          <Box sx={styles.viewToggleContainer}>
            <SegmentedToggle
              value={viewMode}
              onChange={(v) => {
                if (v !== viewMode) onToggleViewMode();
              }}
              options={[
                {
                  value: "employee",
                  label: SELECTOR_TABLE.EMPLOYEE_VIEW,
                  icon: <Users size={16} />,
                },
                {
                  value: "schedule",
                  label: SELECTOR_TABLE.SCHEDULE_VIEW,
                  icon: <CalendarDays size={16} />,
                },
              ]}
              size="medium"
              surface="dark"
            />
          </Box>

          {/* Center: Period title */}
          <Box sx={styles.periodTitleContainer}>
            <Typography variant="body2" sx={styles.periodTitle}>
              {renderPeriodHeader(selectedPeriod, weekNumber, biweekNumber, month, multiplePeriods)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Table header row */}
      <TableRow sx={{
        border: "none !important",
        outline: "none !important",
        boxShadow: "none !important",
        borderTop: "none !important",
        borderBottom: "none !important",
        borderLeft: "none !important",
        borderRight: "none !important",
        "&::before": {
          display: "none !important",
          border: "none !important",
        },
        "&::after": {
          display: "none !important",
          border: "none !important",
        },
        "& td": {
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
          borderTop: "none !important",
          borderBottom: "none !important",
          borderLeft: "none !important",
          borderRight: "none !important",
        },
        "& th": {
          border: "none !important",
          outline: "none !important",
          boxShadow: "none !important",
          borderTop: "none !important",
          borderBottom: "none !important",
          borderLeft: "none !important",
          borderRight: "none !important",
        },
      }}>
        <TableCell
          className="employee-column"
          sx={styles.employeeColumn}
        >
          <TableSortLabel
            direction={orderDirection}
            onClick={onSort}
            sx={{ color: "#fff !important" }}
          >
            {viewMode === "employee" ? SELECTOR_TABLE.EMPLOYEES : SELECTOR_TABLE.SCHEDULES}
          </TableSortLabel>
        </TableCell>

        {currentWeek.map(({ day, date, isoDate }, index) => {
          const today = isToday(isoDate);
          return (
            <TableCell
              key={day}
              align="center"
              sx={styles.dayHeader}
            >
              <Box sx={{ position: 'relative', paddingBottom: '12px' }}>
                <Typography sx={styles.dayHeaderText(today)}>
                  {`${translateDayToAbrevSpanish(day as EnglishDayOfWeek)} ${formatHeaderDate(date)}`}
                </Typography>
                {today && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#39ff14',
                      boxShadow: '0 0 10px #39ff14, 0 0 20px #39ff14',
                      zIndex: 10,
                    }}
                  />
                )}
              </Box>
            </TableCell>
          );
        })}

        {viewMode === "employee" && showHoursColumn && (
          <>
            <TableCell sx={styles.emptyCell} />
            <TableCell align="center" sx={{
              ...styles.periodSelectorCell,
              border: "none !important",
              outline: "none !important",
              boxShadow: "none !important",
              borderTop: "none !important",
              borderBottom: "none !important",
              borderLeft: "none !important",
              borderRight: "none !important",
              appearance: "none !important",
              WebkitAppearance: "none !important",
              MozAppearance: "none !important",
              "&::before": {
                display: "none !important",
                border: "none !important",
              },
              "&::after": {
                display: "none !important",
                border: "none !important",
              },
              "& *": {
                border: "none !important",
                outline: "none !important",
                boxShadow: "none !important",
              },
            }} colSpan={2}>
              <Box sx={{ border: "none !important", outline: "none !important", boxShadow: "none !important" }}>
                <PeriodSelector
                  value={selectedPeriod}
                  onChange={onPeriodChange}
                  theme={theme}
                />
              </Box>
            </TableCell>
          </>
        )}
      </TableRow>
    </>
  );
});
