import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TablePagination,
  TableSortLabel,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  SelectChangeEvent,
  Badge,
  Tooltip,
  TextField,
  Button,
  ListSubheader,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Dialog,
  Grid,
} from "@mui/material";
import PaginationActions from "../Pagination/PaginationActions";
import {
  formatDate,
  formatDateWithoutYear,
  formatHeaderDate,
  getBiweeklyDates,
  getCurrentWeekDates,
  getInvolvedPeriods,
  hasMultipleBiweeks,
  hasMultipleMonths,
  hasMultipleYears,
} from "../../../utils/dates";
import {
  getMonthName,
  getOptionsForDay,
  translateDayToAbrevSpanish,
} from "../../../utils/string";
import {
  calculateTotalHoursAndOvertimeForPeriod,
  calculateTotalHoursAndOvertimeForPeriods,
} from "../../../utils/calculation";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import { STATE, TABLE, PERMISSIONS, SELECTOR_TABLE } from "../../../constants/constants";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

// SelectorTable component displays and manages employee schedules, hours worked, and summary data for different periods (weekly, biweekly, monthly).
// Props:
// - filteredEmployees: list of employees to display
// - schedules: list of schedules for employees
// - hoursWorked: list of hours worked records
// - weeklySummaries, biweeklySummaries, monthlySummaries: summary data for each period
// - weekOffset, weekNumber, biweekNumber, month, year: period info
// - handleChange: handler for schedule changes
// - handleAdjustTime: handler for manual time adjustments
// - permissions: user permissions for actions
// - onInfoClick: handler for info button click
//
// The table supports sorting, pagination, period selection, and responsive design.
// Main logic includes calculating total hours, overtime, and rendering period-based data.

// SelectorTable component for displaying and managing employee schedules and hours
// Props: filteredEmployees, schedules, hoursWorked, summaries, period info, handlers, permissions
interface SelectorTableProps {
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
  handleChange: (
    event: SelectChangeEvent<string>,
    employeeId: number,
    date: Date,
  ) => void;
  handleAdjustTime: (
    employeeId: number,
    condition: string,
    timeAdjustment: number,
  ) => void;
  permissions?: string[];
  onInfoClick?: (employee: Employee) => void;
}

const SelectorTable: React.FC<SelectorTableProps> = React.memo(
  ({
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
    handleAdjustTime,
    permissions,
    onInfoClick,
  }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<
      "weekly" | "biweekly" | "monthly"
    >("weekly");
    const [timeAdjustment, setTimeAdjustment] = useState(0);
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openAdjustDialogEmployee, setOpenAdjustDialogEmployee] =
      useState<Employee | null>(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    // Adjusts rows per page based on screen size
    useEffect(() => {
      if (isSmallScreen) {
        setRowsPerPage(5);
      } else {
        setRowsPerPage(25);
      }
    }, [isSmallScreen]);

    const currentWeek = useMemo(
      () => getCurrentWeekDates(weekOffset),
      [weekOffset],
    );
    const multiplePeriods = getInvolvedPeriods(currentWeek);

    // Memoizes the current week dates based on weekOffset
    const sortedEmployees = useMemo(() => {
      return [...filteredEmployees].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
      });
    }, [filteredEmployees]);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

    // Calculates total hours or overtime for a single period
    const resultHoursForPeriod = (
      employee: Employee,
      period: "weekly" | "biweekly" | "monthly",
      type: "totalHours" | "overtime",
    ) => {
      if (type === "totalHours") {
        return calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          period,
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        ).totalHours;
      } else {
        return calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          period,
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        ).overtime;
      }
    };

    // Calculates total hours or overtime for multiple periods
    const resultHoursForPeriods = (
      employee: Employee,
      period: "weekly" | "biweekly" | "monthly",
      type: "totalHours" | "overtime",
    ) => {
      if (type === "totalHours") {
        return calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          period,
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        ).totalHours;
      } else {
        return calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          period,
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        ).overtime;
      }
    };

    const resultTotalHours = (employee: Employee) => {
      return selectedPeriod === "weekly"
        ? hasMultipleYears(currentWeek)
          ? resultHoursForPeriods(employee, selectedPeriod, "totalHours")
          : resultHoursForPeriod(employee, selectedPeriod, "totalHours")
        : selectedPeriod === "biweekly"
          ? hasMultipleYears(currentWeek) || hasMultipleBiweeks(currentWeek)
            ? resultHoursForPeriods(employee, selectedPeriod, "totalHours")
            : resultHoursForPeriod(employee, selectedPeriod, "totalHours")
          : hasMultipleYears(currentWeek) || hasMultipleMonths(currentWeek)
            ? resultHoursForPeriods(employee, selectedPeriod, "totalHours")
            : resultHoursForPeriod(employee, selectedPeriod, "totalHours");
    };

    const resultOvertime = (employee: Employee) => {
      return selectedPeriod === "weekly"
        ? hasMultipleYears(currentWeek)
          ? resultHoursForPeriods(employee, selectedPeriod, "overtime")
          : resultHoursForPeriod(employee, selectedPeriod, "overtime")
        : selectedPeriod === "biweekly"
          ? hasMultipleYears(currentWeek) || hasMultipleBiweeks(currentWeek)
            ? resultHoursForPeriods(employee, selectedPeriod, "overtime")
            : resultHoursForPeriod(employee, selectedPeriod, "overtime")
          : hasMultipleYears(currentWeek) || hasMultipleMonths(currentWeek)
            ? resultHoursForPeriods(employee, selectedPeriod, "overtime")
            : resultHoursForPeriod(employee, selectedPeriod, "overtime");
    };

    const hasWorkedCurrentWeek = (employee: Employee): boolean => {
      const found = weeklySummaries.some(
        (summary) =>
          summary.employeeId === employee.id &&
          summary.weekNumber === weekNumber &&
          summary.year === year,
      );
      return found;
    };

    return (
      <>
        <Paper sx={{ width: "100%" }}>
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 5,
              backgroundColor: "#f0f2f5",
              padding: isSmallScreen ? "8px" : "16px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              {selectedPeriod === "weekly" ? (
                <div>
                  {hasMultipleYears(currentWeek) ? (
                    <Typography variant="body2" fontWeight="bold">
                      {`${SELECTOR_TABLE.WEEKS} ${multiplePeriods.weekNumbers[1].weekNumber} / `}
                      {multiplePeriods.weekNumbers[0].weekNumber}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                    >{`${SELECTOR_TABLE.WEEK} ${weekNumber}`}</Typography>
                  )}
                </div>
              ) : selectedPeriod === "biweekly" ? (
                <div>
                  {hasMultipleBiweeks(currentWeek) ? (
                    <Typography variant="body2" fontWeight="bold">
                      {`${SELECTOR_TABLE.BIWEEKS} ${multiplePeriods.biweekNumbers[0].biweekNumber} / `}
                      {multiplePeriods.biweekNumbers[1].biweekNumber}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                    >{`${SELECTOR_TABLE.BIWEEK} ${biweekNumber}`}</Typography>
                  )}
                </div>
              ) : (
                <div>
                  {hasMultipleMonths(currentWeek) ? (
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                    >{`${getMonthName(
                      multiplePeriods.months[0].month,
                    )} / ${getMonthName(
                      multiplePeriods.months[1].month,
                    )}`}</Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                    >{`${getMonthName(month)}`}</Typography>
                  )}
                </div>
              )}
            </Box>
          </Box>
          <TableContainer
            className="table-container"
            sx={{ maxHeight: "65vh", overflowX: "auto" }}
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <TableRow>
                  <TableCell
                    className="employee-column"
                    sx={{
                      padding: isSmallScreen ? "8px" : "16px",
                      position: "sticky",
                      left: 0,
                      zIndex: 11,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TableSortLabel
                      direction={orderDirection}
                      onClick={() =>
                        setOrderDirection((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        )
                      }
                    >
                      {SELECTOR_TABLE.EMPLOYEES}
                    </TableSortLabel>
                  </TableCell>
                  {currentWeek.map(({ day, date }) => (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        padding: isSmallScreen ? "8px" : "16px",
                        zIndex: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {`${translateDayToAbrevSpanish(
                        day as EnglishDayOfWeek,
                      )} ${formatHeaderDate(date)}`}
                    </TableCell>
                  ))}
                  {permissions?.includes(
                    PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS,
                  ) && (
                    <>
                      <TableCell />
                      <TableCell
                        align="center"
                        sx={{
                          padding: isSmallScreen ? "8px" : "16px",
                          position: isSmallScreen ? "static" : "sticky",
                          right: 0,
                          zIndex: 3,
                          whiteSpace: "nowrap",
                        }}
                        colSpan={2}
                      >
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: 120,
                            backgroundColor: "#000",
                            borderRadius: 2,
                            ".MuiOutlinedInput-root": {
                              borderRadius: 2,
                              fontWeight: 700,
                              fontSize: "1rem",
                              color: "#fff",
                              backgroundColor: "#000 !important",
                              "& fieldset": {
                                border: "none",
                              },
                            },
                            ".MuiSelect-select": {
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontWeight: 700,
                              color: "#fff",
                              backgroundColor: "#000 !important",
                              pl: 0,
                            },
                            ".MuiSvgIcon-root": {
                              color: "#fff",
                            },
                          }}
                        >
                          <Select
                            value={selectedPeriod}
                            onChange={(e) =>
                              setSelectedPeriod(
                                e.target.value as
                                  | "weekly"
                                  | "biweekly"
                                  | "monthly",
                              )
                            }
                            autoWidth
                            label="Total"
                            input={
                              <OutlinedInput
                                label="Total"
                                id="total-period-select"
                                startAdornment={
                                  <InputAdornment position="start">
                                    <CalendarMonthOutlinedIcon
                                      sx={{ color: "#fff", mr: 1 }}
                                    />
                                  </InputAdornment>
                                }
                                sx={{
                                  color: "#fff",
                                  backgroundColor: "#000 !important",
                                  borderRadius: 2,
                                  fontWeight: 700,
                                  fontSize: "1rem",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                }}
                              />
                            }
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  backgroundColor: "#000",
                                  color: theme.palette.text.disabled,
                                  borderRadius: 2,
                                  boxShadow: theme.shadows[8],
                                  mt: 1,
                                  "& .MuiMenuItem-root": {
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    color: theme.palette.text.disabled,
                                    "&:hover": {
                                      backgroundColor: theme.palette.grey[900],
                                      color: "#fff",
                                    },
                                    "&.Mui-selected": {
                                      backgroundColor:
                                        theme.palette.primary.main,
                                      color: "#fff",
                                      "&:hover": {
                                        backgroundColor:
                                          theme.palette.primary.dark,
                                        color: "#fff",
                                      },
                                    },
                                  },
                                },
                              },
                            }}
                          >
                            <MenuItem value="weekly">{SELECTOR_TABLE.WEEKLY}</MenuItem>
                            <MenuItem value="biweekly">{SELECTOR_TABLE.BIWEEKLY}</MenuItem>
                            <MenuItem value="monthly">{SELECTOR_TABLE.MONTHLY}</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((employee, rowIndex) => (
                  <TableRow
                    key={employee.id}
                    sx={{
                      backgroundColor: rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                    }}
                  >
                    <TableCell
                      sx={{
                        padding: isSmallScreen ? "8px" : "16px",
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        backgroundColor:
                          rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          whiteSpace: isSmallScreen ? "break-spaces" : "nowrap",
                          gap: 0,
                        }}
                      >
                        <Typography variant="body2">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        {permissions?.includes(
                          PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS,
                        ) && (
                          <IconButton
                            onClick={() => onInfoClick && onInfoClick(employee)}
                            size="small"
                            sx={{ ml: 0, p: 0.5 }}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    {currentWeek.map(({ day, date }) => {
                      const formattedDate = format(
                        new Date(date),
                        "yyyy-MM-dd",
                      );
                      const existingRecord = hoursWorked.find(
                        (record) =>
                          record.employeeId === employee.id &&
                          format(new Date(record.date), "yyyy-MM-dd") ===
                            formattedDate,
                      );
                      const options = getOptionsForDay(day, schedules);
                      const validLabels = options.map((option) => option.label);

                      const selectedLabel =
                        schedules.find(
                          (schedule) =>
                            schedule.id === existingRecord?.scheduleId,
                        )?.label ?? STATE.FREE;

                      const finalSelectedLabel = validLabels.includes(
                        selectedLabel,
                      )
                        ? selectedLabel
                        : (validLabels[0] ?? "");

                      return (
                        <TableCell
                          key={day}
                          sx={{
                            padding: isSmallScreen ? "8px" : "16px",
                            backgroundColor:
                              format(new Date(), "yyyy-MM-dd") ===
                              format(new Date(date), "yyyy-MM-dd")
                                ? "#e4f5ed"
                                : rowIndex % 2 === 0
                                  ? "white"
                                  : "#f5f5f5",
                          }}
                        >
                          <FormControl fullWidth>
                            <Select
                              value={finalSelectedLabel}
                              onChange={(event: SelectChangeEvent<string>) =>
                                handleChange(event, employee.id, new Date(date))
                              }
                              disabled={
                                !permissions?.includes(
                                  PERMISSIONS.EDIT_EMPLOYEE_ROLES,
                                )
                              }
                              input={
                                <OutlinedInput
                                  notched={false}
                                  label="Ubicación"
                                />
                              }
                            >
                                                              <ListSubheader>
                                  <strong>{SELECTOR_TABLE.LOCATIONS}</strong>
                                </ListSubheader>
                              {options
                                .filter((option) => !option.specialSchedule)
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((option) => (
                                  <MenuItem
                                    key={option.id}
                                    value={option.label}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              <Divider />
                                                              <ListSubheader>
                                  <strong>{SELECTOR_TABLE.SPECIAL_SCHEDULES}</strong>
                                </ListSubheader>
                              {options
                                .filter((option) => option.specialSchedule)
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((option) => (
                                  <MenuItem
                                    key={option.id}
                                    value={option.label}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              <Divider />
                              {permissions?.includes(
                                PERMISSIONS.CREATE_SCHEDULES,
                              ) && (
                                <MenuItem value={"Other"}>
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    width="100%"
                                    alignItems="center"
                                  >
                                    {SELECTOR_TABLE.OTHER}
                                  </Box>
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </TableCell>
                      );
                    })}
                    {permissions?.includes(
                      PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS,
                    ) && (
                      <>
                        <TableCell
                          align="center"
                          sx={{
                            padding: isSmallScreen ? "8px" : "16px",
                            backgroundColor:
                              rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                          }}
                        >
                          <IconButton
                            onClick={() =>
                              setOpenAdjustDialogEmployee(employee)
                            }
                            disabled={!hasWorkedCurrentWeek(employee)}
                            sx={{
                              color: hasWorkedCurrentWeek(employee)
                                ? "#000"
                                : "#ccc",
                              backgroundColor: "transparent",
                              borderRadius: "50%",
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.04)",
                              },
                              width: 40,
                              height: 40,
                            }}
                          >
                            <MoreTimeIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: isSmallScreen ? "8px" : "16px",
                            position: isSmallScreen ? "static" : "sticky",
                            right: 0,
                            zIndex: 2,
                            backgroundColor:
                              rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              height: "64px",
                              paddingX: 0,
                              gap: 0,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                flexGrow: 1,
                                justifyContent: "center",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <strong>{resultTotalHours(employee)}</strong>
                              &nbsp;{SELECTOR_TABLE.HOURS}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                ml: 0,
                              }}
                            >
                              <Tooltip title={SELECTOR_TABLE.OVERTIME_HOURS} arrow>
                                <Box>
                                  <Badge
                                    badgeContent={resultOvertime(employee)}
                                    max={9999999}
                                    color={
                                      resultOvertime(employee) === 0 ||
                                      resultOvertime(employee) === "0/0"
                                        ? "success"
                                        : "warning"
                                    }
                                    showZero
                                  >
                                    <AccessTimeRoundedIcon />
                                  </Badge>
                                </Box>
                              </Tooltip>
                            </Box>
                          </Box>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {!isSmallScreen && (
              <div>
                {selectedPeriod === "weekly" ? (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Semana del{" "}
                    {formatDateWithoutYear(new Date(currentWeek[0]?.date))} al{" "}
                    {formatDate(new Date(currentWeek[6]?.date), false)}
                  </Typography>
                ) : selectedPeriod === "biweekly" ? (
                  <div>
                    {hasMultipleBiweeks(currentWeek) ? (
                      <Typography
                        variant="body2"
                        sx={{ ml: 2 }}
                      >{`Quincenas del ${formatDateWithoutYear(
                        getBiweeklyDates(
                          year,
                          multiplePeriods.biweekNumbers[0].biweekNumber,
                        ).startDate,
                      )} al ${formatDateWithoutYear(
                        getBiweeklyDates(
                          year,
                          multiplePeriods.biweekNumbers[0].biweekNumber,
                        ).endDate,
                      )} / ${formatDateWithoutYear(
                        getBiweeklyDates(
                          year,
                          multiplePeriods.biweekNumbers[1].biweekNumber,
                        ).startDate,
                      )} al ${formatDateWithoutYear(
                        getBiweeklyDates(
                          year,
                          multiplePeriods.biweekNumbers[1].biweekNumber,
                        ).endDate,
                      )} del ${year}`}</Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ ml: 2 }}
                      >{`Quincena del ${formatDateWithoutYear(
                        getBiweeklyDates(year, biweekNumber).startDate,
                      )} al ${formatDateWithoutYear(
                        getBiweeklyDates(year, biweekNumber).endDate,
                      )}`}</Typography>
                    )}
                  </div>
                ) : (
                  <div>
                    {hasMultipleMonths(currentWeek) ? (
                      <Typography
                        variant="body2"
                        sx={{ ml: 2 }}
                      >{`${getMonthName(
                        multiplePeriods.months[0].month,
                      )} / ${getMonthName(
                        multiplePeriods.months[1].month,
                      )} del ${year}`}</Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ ml: 2 }}
                      >{`${getMonthName(month)}`}</Typography>
                    )}
                  </div>
                )}
              </div>
            )}
            <TablePagination
              className="pagination"
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={sortedEmployees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage={
                <Typography variant="body2" component="span">
                  {TABLE.ROWS_PER_PAGE}
                </Typography>
              }
              labelDisplayedRows={() => ""}
              ActionsComponent={PaginationActions}
            />
          </Box>
        </Paper>
        {openAdjustDialogEmployee && (
          <Dialog
            open={!!openAdjustDialogEmployee}
            onClose={() => setOpenAdjustDialogEmployee(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                border: "2px solid #fff",
                borderRadius: 3,
              },
            }}
          >
            <Box
              sx={{
                background: theme.palette.primary.main,
                color: "#fff",
                p: { xs: 3, sm: 4 },
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                                  <Typography variant="h5" fontWeight={700} color="#fff">
                    {SELECTOR_TABLE.ADJUST_HOURS}
                  </Typography>
                <Typography variant="subtitle2" color="#fff">
                  {openAdjustDialogEmployee.firstName}{" "}
                  {openAdjustDialogEmployee.lastName}
                </Typography>
              </Box>
              <Box flexGrow={1} />
              <IconButton
                onClick={() => setOpenAdjustDialogEmployee(null)}
                sx={{ color: "#fff" }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Box>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" mb={1}>
                    {selectedPeriod === "weekly"
                      ? SELECTOR_TABLE.WEEKLY_HOURS_MESSAGE
                      : selectedPeriod === "biweekly"
                        ? SELECTOR_TABLE.BIWEEKLY_HOURS_MESSAGE
                        : SELECTOR_TABLE.MONTHLY_HOURS_MESSAGE}
                  </Typography>
                  <Typography
                    variant="h3"
                    color="primary"
                    fontWeight={800}
                    mb={2}
                  >
                    {selectedPeriod === "weekly"
                      ? resultHoursForPeriod(
                          openAdjustDialogEmployee,
                          "weekly",
                          "totalHours",
                        )
                      : selectedPeriod === "biweekly"
                        ? resultHoursForPeriod(
                            openAdjustDialogEmployee,
                            "biweekly",
                            "totalHours",
                          )
                        : resultHoursForPeriod(
                            openAdjustDialogEmployee,
                            "monthly",
                            "totalHours",
                          )}
                  </Typography>
                  <TextField
                    label={SELECTOR_TABLE.HOURS_TO_ADJUST}
                    variant="outlined"
                    type="number"
                    placeholder="0"
                    value={timeAdjustment}
                    onChange={(e) => setTimeAdjustment(Number(e.target.value))}
                    sx={{ mt: 1, width: "100%", boxSizing: "border-box" }}
                    inputProps={{ min: 0 }}
                    error={timeAdjustment < 0}
                    helperText={
                      timeAdjustment < 0 ? SELECTOR_TABLE.POSITIVE_NUMBER_REQUIRED : " "
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeRoundedIcon
                            color={timeAdjustment < 0 ? "error" : "primary"}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: { xs: 1.5, sm: 2 },
                      backgroundColor: theme.palette.action.hover,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: theme.palette.divider,
                    }}
                  >
                    <Box
                      sx={{
                        mr: { xs: 1, sm: 2 },
                        color: theme.palette.info.main,
                      }}
                    >
                      <InfoOutlinedIcon
                        sx={{
                          color: theme.palette.info.main,
                          mr: { xs: 1, sm: 2 },
                        }}
                      />
                    </Box>
                    <Box>
                      <Box
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 0.5,
                          fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                        }}
                      >
                        {SELECTOR_TABLE.ADJUSTMENT_INFO}
                      </Box>
                      <Box
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                        }}
                      >
                        {SELECTOR_TABLE.ADJUSTMENT_DESCRIPTION}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      gap: { xs: 1, sm: 2 },
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: theme.palette.divider,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setOpenAdjustDialogEmployee(null)}
                      fullWidth={isSmallScreen}
                      sx={{
                        minHeight: { xs: 44, sm: 48 },
                        fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                      }}
                    >
                      {SELECTOR_TABLE.CANCEL}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        handleAdjustTime(
                          openAdjustDialogEmployee.id,
                          "sum",
                          timeAdjustment,
                        );
                        setOpenAdjustDialogEmployee(null);
                      }}
                      disabled={timeAdjustment <= 0}
                      fullWidth={isSmallScreen}
                      sx={{
                        minHeight: { xs: 44, sm: 48 },
                        fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                        fontWeight: 600,
                        px: { xs: 2, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                      }}
                    >
                      {SELECTOR_TABLE.ADD}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        handleAdjustTime(
                          openAdjustDialogEmployee.id,
                          "substract",
                          timeAdjustment,
                        );
                        setOpenAdjustDialogEmployee(null);
                      }}
                      disabled={timeAdjustment <= 0}
                      fullWidth={isSmallScreen}
                      sx={{
                        minHeight: { xs: 44, sm: 48 },
                        fontSize: "clamp(0.75rem, 1.25vw, 0.875rem)",
                        fontWeight: 600,
                        px: { xs: 2, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                      }}
                    >
                      {SELECTOR_TABLE.SUBTRACT}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Dialog>
        )}
      </>
    );
  },
);

SelectorTable.displayName = "SelectorTable";

SelectorTable.propTypes = {
  filteredEmployees: PropTypes.array.isRequired,
  schedules: PropTypes.array.isRequired,
  hoursWorked: PropTypes.array.isRequired,
  weeklySummaries: PropTypes.array.isRequired,
  biweeklySummaries: PropTypes.array.isRequired,
  monthlySummaries: PropTypes.array.isRequired,
  weekOffset: PropTypes.number.isRequired,
  weekNumber: PropTypes.number.isRequired,
  biweekNumber: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleAdjustTime: PropTypes.func.isRequired,
  permissions: PropTypes.array,
  onInfoClick: PropTypes.func,
};

export default SelectorTable;
