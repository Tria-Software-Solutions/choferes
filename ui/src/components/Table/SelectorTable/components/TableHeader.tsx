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
import { getTableHeaderStyles, getPremiumToggleStyles } from "../styles/tableHeader.styles";

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
  const premiumStyles = getPremiumToggleStyles(theme);
  const showHoursColumn = permissions?.includes(PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS);
  const isEmployeeView = viewMode === "employee";

  return (
    <>
      {/* Top header bar */}
      <Box sx={styles.topHeader}>
        <Box sx={styles.headerFlexContainer}>
          {/* Left: Premium View toggle */}
          <Box sx={styles.viewToggleContainer}>
            <Box
              onClick={onToggleViewMode}
              sx={premiumStyles.toggleContainer}
            >
              {/* Animated background slider */}
              <Box
                sx={{
                  ...premiumStyles.slider,
                  transform: isEmployeeView ? "translateX(0)" : "translateX(100%)",
                }}
              />

              {/* Employee view option */}
              <Box sx={premiumStyles.option(isEmployeeView)}>
                <Users size={14} style={{ marginRight: 6 }} />
                <Typography
                  variant="caption"
                  sx={premiumStyles.optionText(isEmployeeView)}
                >
                  {SELECTOR_TABLE.EMPLOYEE_VIEW}
                </Typography>
              </Box>

              {/* Schedule view option */}
              <Box sx={premiumStyles.option(!isEmployeeView)}>
                <CalendarDays size={14} style={{ marginRight: 6 }} />
                <Typography
                  variant="caption"
                  sx={premiumStyles.optionText(!isEmployeeView)}
                >
                  {SELECTOR_TABLE.SCHEDULE_VIEW}
                </Typography>
              </Box>
            </Box>
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
      <TableRow>
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

        {currentWeek.map(({ day, date }) => (
          <TableCell
            key={day}
            align="center"
            sx={styles.dayHeader}
          >
            {`${translateDayToAbrevSpanish(day as EnglishDayOfWeek)} ${formatHeaderDate(date)}`}
          </TableCell>
        ))}

        {viewMode === "employee" && showHoursColumn && (
          <>
            <TableCell sx={styles.emptyCell} />
            <TableCell align="center" sx={styles.periodSelectorCell} colSpan={2}>
              <PeriodSelector
                value={selectedPeriod}
                onChange={onPeriodChange}
                theme={theme}
              />
            </TableCell>
          </>
        )}
      </TableRow>
    </>
  );
});
