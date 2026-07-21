import React from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import PremiumTooltip from "../../PremiumTooltip/PremiumTooltip.component";
import { EmployeeCellDropdown } from "./components/EmployeeCellDropdown";
import { ScheduleCellDropdown } from "./components/ScheduleCellDropdown";
import {
  calculateTotalHours,
  calculateOvertime,
  getScheduleCellData,
  renderPeriodHeader,
  renderPeriodFooter,
} from "./helpers";
import { translateDayToAbrevSpanish } from "../../../utils/string";
import { formatHeaderDate } from "../../../utils/dates";
import {
  getCurrentWeekDates,
  getInvolvedPeriods,
} from "../../../utils/dates";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import {
  SELECTOR_TABLE,
  PERMISSIONS,
} from "../../../constants/constants";
import PaginationComponent from "../Pagination/Pagination.component";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";

interface MobileLayoutProps {
  filteredEmployees: Employee[];
  schedules: Schedule[];
  hoursWorked: HoursWorked[];
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
  weekOffset: number;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  handleChange: (value: string, employeeId: number, date: Date) => void;
  permissions?: string[];
  viewMode: "employee" | "schedule";
  setViewMode: React.Dispatch<React.SetStateAction<"employee" | "schedule">>;
  onInfoClick?: (employee: Employee) => void;
  onAdjustClick?: (employee: Employee) => void;
  onAddScheduleClick: () => void;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  employeeSearchTerms: Record<string, string>;
  onSearchChange: (scheduleId: number, date: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScheduleEmployeesChange: (value: number[], scheduleId: number, date: string) => void;
}

const SelectorTableMobileLayout: React.FC<MobileLayoutProps> = ({
  filteredEmployees,
  schedules,
  hoursWorked,
  weeklySummaries,
  biweeklySummaries,
  monthlySummaries,
  weekOffset,
  weekNumber,
  biweekNumber,
  month,
  year,
  handleChange,
  permissions,
  viewMode,
  setViewMode,
  onInfoClick,
  onAdjustClick,
  onAddScheduleClick,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  employeeSearchTerms,
  onSearchChange,
  onScheduleEmployeesChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const currentWeek = React.useMemo(
    () => getCurrentWeekDates(weekOffset),
    [weekOffset]
  );
  const multiplePeriods = getInvolvedPeriods(currentWeek);

  const hasPermissions = permissions?.includes(PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS);
  const canEdit = permissions?.includes(PERMISSIONS.EDIT_EMPLOYEE_ROLES);

  const cardSx = {
    borderRadius: "16px",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    backgroundColor: theme.palette.background.paper,
    overflow: "hidden",
    mb: 1.5,
  };

  const dayCellSx = (isTodayDate: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    py: 1,
    px: 1.5,
    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
    backgroundColor: isTodayDate
      ? (isDark ? "rgba(0,188,212,0.08)" : "rgba(0,188,212,0.04)")
      : "transparent",
  });

  const employees = filteredEmployees;
  const paginatedEmployees = employees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const resultTotalHours = (employee: Employee) => {
    return calculateTotalHours(
      employee,
      "weekly",
      currentWeek,
      weekNumber,
      biweekNumber,
      month,
      year,
      weeklySummaries,
      biweeklySummaries,
      monthlySummaries,
      multiplePeriods
    );
  };

  const resultOvertime = (employee: Employee) => {
    return calculateOvertime(
      employee,
      "weekly",
      currentWeek,
      weekNumber,
      biweekNumber,
      month,
      year,
      weeklySummaries,
      biweeklySummaries,
      monthlySummaries,
      multiplePeriods
    );
  };

  const handleInfoClick = (employee: Employee) => {
    onInfoClick?.(employee);
  };

  const handleAdjustClick = (employee: Employee) => {
    onAdjustClick?.(employee);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isDark ? "#1a1a1a" : "#fafafa",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setViewMode(viewMode === "employee" ? "schedule" : "employee")}
            sx={{
              backgroundColor: "transparent",
              p: 0.5,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            <SwapHorizIcon sx={{ fontSize: "1.2rem" }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
            {viewMode === "employee"
              ? SELECTOR_TABLE.EMPLOYEES
              : SELECTOR_TABLE.SCHEDULES}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" }}>
          {renderPeriodHeader(
            "weekly",
            currentWeek,
            weekNumber,
            biweekNumber,
            month,
            year,
            multiplePeriods
          )}
        </Typography>
      </Box>

      {/* Scrollable Card List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
        {viewMode === "employee" ? (
          <>
            {paginatedEmployees.map((employee) => (
              <Paper key={employee.id} elevation={0} sx={cardSx}>
                {/* Employee Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 1.5,
                    py: 1.25,
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {hasPermissions && (
                      <>
                        <PremiumTooltip title="Ver información">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleInfoClick(employee)}
                            sx={{ p: 0.5 }}
                          >
                            <InfoOutlinedIcon sx={{ fontSize: "1.1rem" }} />
                          </IconButton>
                        </PremiumTooltip>
                        <PremiumTooltip title="Ajustar horas">
                          <span>
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleAdjustClick(employee)}
                              sx={{ p: 0.5 }}
                            >
                              <MoreTimeIcon sx={{ fontSize: "1.1rem" }} />
                            </IconButton>
                          </span>
                        </PremiumTooltip>
                      </>
                    )}
                    {/* Total + Overtime Badge */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        ml: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          color: "text.primary",
                        }}
                      >
                        {resultTotalHours(employee)}h
                      </Typography>
                      {Number(resultOvertime(employee)) > 0 && (
                        <Box
                          sx={{
                            minWidth: 20,
                            height: 20,
                            px: 0.5,
                            borderRadius: "10px",
                            backgroundColor: "success.main",
                            color: "#fff",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          +{resultOvertime(employee)}
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Box>

                {/* Day Cells */}
                {currentWeek.map(({ day, date, isoDate }) => {
                  const isTodayDate =
                    new Date().toDateString() === new Date(isoDate).toDateString();
                  const scheduleData = getScheduleCellData(
                    employee,
                    day,
                    date,
                    schedules,
                    hoursWorked
                  );

                  return (
                    <Box key={day} sx={dayCellSx(isTodayDate)}>
                      <Box sx={{ minWidth: 60, flexShrink: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: isTodayDate ? 700 : 600,
                            fontSize: "0.75rem",
                            color: isTodayDate ? "#00BCD4" : "text.primary",
                          }}
                        >
                          {translateDayToAbrevSpanish(day as EnglishDayOfWeek)}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.65rem",
                            color: isTodayDate ? "#00BCD4" : "text.secondary",
                            fontWeight: isTodayDate ? 600 : 400,
                          }}
                        >
                          {formatHeaderDate(date)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, ml: 1, minWidth: 0 }}>
                        <EmployeeCellDropdown
                          value={scheduleData.finalSelectedLabel}
                          options={scheduleData.options}
                          disabled={!canEdit}
                          onChange={(value) =>
                            handleChange(value, employee.id, new Date(date))
                          }
                          theme={theme}
                          styles={{}}
                          onAddSchedule={onAddScheduleClick}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Paper>
            ))}
          </>
        ) : (
          <>
            {schedules.map((schedule) => {
              const days = schedule.days;
              return (
                <Paper key={schedule.id} elevation={0} sx={cardSx}>
                  {/* Schedule Header */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {schedule.label}
                    </Typography>
                  </Box>

                  {/* Day Cells */}
                  {currentWeek.map(({ day, date, isoDate }) => {
                    const isTodayDate =
                      new Date().toDateString() === new Date(isoDate).toDateString();
                    const isAvailable = days.includes(day.toLowerCase());
                    const assignedEmployees = isAvailable
                      ? getEmployeesForScheduleAndDay(
                          schedule.id,
                          date,
                          filteredEmployees,
                          hoursWorked
                        )
                      : [];

                    return (
                      <Box key={day} sx={dayCellSx(isTodayDate)}>
                        <Box sx={{ minWidth: 60, flexShrink: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: isTodayDate ? 700 : 600,
                              fontSize: "0.75rem",
                              color: isTodayDate ? "#00BCD4" : "text.primary",
                            }}
                          >
                            {translateDayToAbrevSpanish(day as EnglishDayOfWeek)}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.65rem",
                              color: "text.secondary",
                            }}
                          >
                            {formatHeaderDate(date)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, ml: 1, minWidth: 0 }}>
                          {isAvailable ? (
                            <ScheduleCellDropdown
                              assignedEmployees={assignedEmployees}
                              filteredEmployees={filteredEmployees}
                              canEdit={canEdit}
                              employeeSearchTerms={employeeSearchTerms}
                              onScheduleEmployeesChange={onScheduleEmployeesChange}
                              onSearchChange={onSearchChange}
                              scheduleForDay={schedule}
                              date={date}
                              theme={theme}
                              styles={{}}
                            />
                          ) : (
                            <Typography
                              sx={{
                                color: theme.palette.text.disabled,
                                fontSize: "0.8rem",
                                textAlign: "center",
                              }}
                            >
                              {SELECTOR_TABLE.NO_AVAILABLE}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Paper>
              );
            })}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 1.5,
          py: 0.5,
          flexShrink: 0,
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontSize: "0.7rem" }}
        >
          {renderPeriodFooter(
            "weekly",
            currentWeek,
            weekNumber,
            biweekNumber,
            month,
            year,
            multiplePeriods
          )}
        </Typography>
        <PaginationComponent
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => onPageChange(newPage)}
        />
      </Box>
    </Box>
  );
};

export default React.memo(SelectorTableMobileLayout);

// Helper function needed for schedule view mode
function getEmployeesForScheduleAndDay(
  scheduleId: number,
  date: string,
  employees: Employee[],
  hoursWorked: HoursWorked[]
): Employee[] {
  return employees.filter((employee) => {
    const sameDayRecords = hoursWorked
      .filter(
        (record) =>
          record.employeeId === employee.id &&
          new Date(record.date).toDateString() === new Date(date).toDateString()
      )
      .sort((a, b) => b.id - a.id);
    const latestRecord = sameDayRecords[0];
    return latestRecord?.scheduleId === scheduleId;
  });
}
