import React, { useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
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
  Stack,
  OutlinedInput,
  IconButton,
  ListSubheader,
  Checkbox,
} from "@mui/material";
import PaginationComponent from "../Pagination/Pagination.component";
import {
  formatHeaderDate,
  getCurrentWeekDates,
  getInvolvedPeriods,
} from "../../../utils/dates";
import {
  translateDayToAbrevSpanish,
} from "../../../utils/string";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import {
  TABLE,
  PERMISSIONS,
  SELECTOR_TABLE,
} from "../../../constants/constants";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  paperStyles,
  stickyHeaderBoxStyles,
  headerFlexBoxStyles,
  tableContainerStyles,
  tableHeadStyles,
  employeeColumnCellStyles,
  tableCellStyles,
  boldTypographyStyles,
  menuItemStyles,
  listSubheaderStyles,
  stackTotalHoursStyles,
  totalHoursTypographyStyles,
  tableRowBackground,
  tableCellBackground,
  employeeCellBoxStyles,
} from "./SelectorTable.styles";

// Import helper functions
import {
  calculateTotalHours,
  calculateOvertime,
  hasWorkedCurrentWeek,
  sortEmployeesByName,
  paginateEmployees,
  generateRowsPerPageOptions,
  renderPeriodHeader,
  renderPeriodFooter,
  getPeriodMessage,
  getScheduleCellData,
  isToday,
  getOvertimeBadgeColor,
  getDialogTitle,
  getCurrentHoursDisplay,
  getTimeAdjustmentError,
  getTimeAdjustmentIconColor,
} from "./helpers";
import AdjustHoursDialog from "../../../pages/Forms/AdjustHoursDialog";
import WorkedHoursSummaryDialog from "../../../pages/Forms/WorkedHoursSummaryDialog";
import DialogComponent from '../../Dialog/Dialog.component';
import { addDialogPaperSx } from '../../../pages/Management/EmployeesPage/styles';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { createOrUpdateHoursWorked } from "../../../store/slices/hoursWorkedSlice";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SearchBarComponent from "../../SearchBar/SearchBar.component";


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
    condition: 'add' | 'subtract',
    timeAdjustment: number,
  ) => void;
  permissions?: string[];
  rowsPerPage?: number;
  setRowsPerPage?: (rows: number) => void;
  viewMode: 'employee' | 'schedule';
  setViewMode: React.Dispatch<React.SetStateAction<'employee' | 'schedule'>>;
}

const SelectorTableComponent: React.FC<SelectorTableProps> = ({
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
  rowsPerPage: rowsPerPageProp,
  setRowsPerPage: setRowsPerPageProp,
  viewMode,
  setViewMode,
}) => {
  const navigate = useNavigate();
  const [timeAdjustment, setTimeAdjustment] = useState(0);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(5);
  const rowsPerPage = rowsPerPageProp !== undefined ? rowsPerPageProp : localRowsPerPage;
  const setRowsPerPage = setRowsPerPageProp !== undefined ? setRowsPerPageProp : setLocalRowsPerPage;
  const [openAdjustDialogEmployee, setOpenAdjustDialogEmployee] =
    useState<Employee | null>(null);
  const [openInfoDialogEmployee, setOpenInfoDialogEmployee] = useState<Employee | null>(null);
  const [summaryTab, setSummaryTab] = useState<"weekly" | "biweekly" | "monthly" | "overtime">("weekly");
  type PeriodType = 'weekly' | 'biweekly' | 'monthly';
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('weekly');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const theme = useTheme();
  
  // Handle menu state
  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setEmployeeSearchTerm('');
  };

  // Handle ESC key to close search
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        handleMenuClose();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Prevent menu from closing when clicking on search
  const handleSearchClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeadRef = useRef<HTMLTableSectionElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const currentWeek = useMemo(
    () => getCurrentWeekDates(weekOffset),
    [weekOffset],
  );
  const multiplePeriods = getInvolvedPeriods(currentWeek);

  const dispatch = useDispatch<AppDispatch>();

  // Use helper functions for employee data processing
  const sortedEmployees = useMemo(() => {
    return sortEmployeesByName(filteredEmployees, orderDirection);
  }, [filteredEmployees, orderDirection]);

  const paginatedEmployees = paginateEmployees(sortedEmployees, page, rowsPerPage);

  // Use helper functions for hours calculations
  // 2. Usar selectedPeriod en lugar de 'weekly' en las funciones de totales y overtime
  const resultTotalHours = (employee: Employee) => {
    return calculateTotalHours(
      employee,
      selectedPeriod,
      currentWeek,
      weekNumber,
      biweekNumber,
      month,
      year,
      weeklySummaries,
      biweeklySummaries,
      monthlySummaries,
      multiplePeriods,
    );
  };

  const resultOvertime = (employee: Employee) => {
    return calculateOvertime(
      employee,
      selectedPeriod,
      currentWeek,
      weekNumber,
      biweekNumber,
      month,
      year,
      weeklySummaries,
      biweeklySummaries,
      monthlySummaries,
      multiplePeriods,
    );
  };

  const hasWorkedCurrentWeekForEmployee = (employee: Employee): boolean => {
    return hasWorkedCurrentWeek(employee, weekNumber, year, weeklySummaries);
  };

  // Use helper function for rows per page options
  const rowsPerPageOptions = generateRowsPerPageOptions(rowsPerPage);

  // Helper functions for tabbed summary dialog
  function hasOvertime(s: unknown): s is { overtimeHours: number } {
    return typeof s === 'object' && s !== null && 'overtimeHours' in s;
  }
  const getEmployeeWeeklyHours = (id: number) => {
    const summary = weeklySummaries.find(s => s.employeeId === id && s.weekNumber === weekNumber && s.year === year);
    return summary ? summary.totalHours : 0;
  };
  const getEmployeeBiweeklyHours = (id: number) => {
    const summary = biweeklySummaries.find(s => s.employeeId === id && s.biweekNumber === biweekNumber && s.year === year);
    return summary ? summary.totalHours : 0;
  };
  const getEmployeeMonthlyHours = (id: number) => {
    const summary = monthlySummaries.find(s => s.employeeId === id && s.month === month && s.year === year);
    return summary ? summary.totalHours : 0;
  };
  const getEmployeeOvertime = (id: number) => {
    const summary = weeklySummaries.find(s => s.employeeId === id && s.weekNumber === weekNumber && s.year === year);
    return summary && hasOvertime(summary) ? summary.overtimeHours || 0 : 0;
  };

  // Helper para obtener empleados asignados a un schedule en un día
  const getEmployeesForScheduleAndDay = (
    scheduleId: number,
    date: string,
    employees: Employee[],
    hoursWorked: HoursWorked[]
  ) => {
    return employees.filter((employee) => {
      return hoursWorked.some(
        (record) =>
          record.employeeId === employee.id &&
          record.scheduleId === scheduleId &&
          new Date(record.date).toDateString() === new Date(date).toDateString()
      );
    });
  };

  // All schedules for schedule view (unique by ID, sorted alphabetically with non-special first)
  const allSchedules = useMemo(() => {
    const uniqueSchedules = schedules.filter((s) => s.id !== undefined);
    // Remove duplicates by ID
    const seen = new Set();
    const uniqueSchedulesList = uniqueSchedules.filter((schedule) => {
      if (seen.has(schedule.id)) {
        return false;
      }
      seen.add(schedule.id);
      return true;
    });
    
    // Sort: non-special schedules first, then alphabetically
    return uniqueSchedulesList.sort((a, b) => {
      // First, sort by specialSchedule (non-special first)
      if (a.specialSchedule !== b.specialSchedule) {
        return a.specialSchedule ? 1 : -1; // false (non-special) comes first
      }
      // Then sort alphabetically by label
      return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
    });
  }, [schedules]);

  // Handler to change the assigned employees to a schedule in one day
  const handleScheduleEmployeesChange = (
    event: SelectChangeEvent<number[]>,
    scheduleId: number,
    date: string
  ) => {
    const selectedEmployeeIds = event.target.value as number[];
    // Get employees currently assigned
    const currentlyAssigned = getEmployeesForScheduleAndDay(
      scheduleId,
      date,
      filteredEmployees,
      hoursWorked
    ).map((e) => e.id);
    // Add new assigned
    selectedEmployeeIds.forEach((empId) => {
      if (!currentlyAssigned.includes(empId)) {
        dispatch(
          createOrUpdateHoursWorked({
            employeeId: empId,
            scheduleId,
            date: new Date(date).toISOString(),
          })
        );
      }
    });
    // Remove unassinged
    currentlyAssigned.forEach((empId) => {
      if (!selectedEmployeeIds.includes(empId)) {
        // Search hoursWorked for that empId, scheduleId, date
        const record = hoursWorked.find(
          (r) =>
            r.employeeId === empId &&
            r.scheduleId === scheduleId &&
            new Date(r.date).toDateString() === new Date(date).toDateString()
        );
        if (record) {
          dispatch(
            createOrUpdateHoursWorked({
              ...record,
              scheduleId: undefined, 
            })
          );
        }
      }
    });
  };

  return (
    <>
      <Paper sx={paperStyles}>

        
        <Box sx={stickyHeaderBoxStyles(isSmallScreen)}>
          <Box
            sx={{
              ...headerFlexBoxStyles,
              position: "relative",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Button aligned to the left */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              sx={{ position: "absolute", left: 0, top: 0, height: "100%" }}
            >
              <IconButton
                aria-label="Cambiar vista"
                onClick={() =>
                  setViewMode(viewMode === "employee" ? "schedule" : "employee")
                }
                sx={{ mr: 1 }}
              >
                <SwapHorizIcon />
              </IconButton>
              <Typography variant="caption" sx={{ mr: 2 }}>
                {viewMode === "employee"
                  ? "Vista por empleado"
                  : "Vista por horario"}
              </Typography>
            </Box>
            {/* Center title */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="100%"
            >
              <Typography variant="body2" sx={boldTypographyStyles}>
                {renderPeriodHeader(
                  selectedPeriod,
                  currentWeek,
                  weekNumber,
                  biweekNumber,
                  month,
                  year,
                  multiplePeriods
                )}
              </Typography>
            </Box>
          </Box>
        </Box>
        <TableContainer
          className="table-container"
          sx={{ ...tableContainerStyles, maxHeight: "60vh" }}
          ref={tableContainerRef}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead
              sx={{
                ...tableHeadStyles,
                position: "relative",
                backgroundColor: "transparent",
                "&::before": {
                  content: '""',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "100%",
                  backgroundColor: "#f0f2f5",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  zIndex: 0,
                },
              }}
              ref={tableHeadRef}
            >
              <TableRow>
                <TableCell
                  className="employee-column"
                  sx={{
                    ...employeeColumnCellStyles(isSmallScreen),
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#111"
                        : theme.palette.primary.main,
                    color:
                      theme.palette.mode === "dark"
                        ? "#fff"
                        : theme.palette.primary.contrastText,
                    position: "relative",
                    zIndex: 1,
                    minHeight: viewMode === "schedule" ? "40px" : "auto",
                    height: viewMode === "schedule" ? "40px" : "auto",
                  }}
                >
                  <TableSortLabel
                    direction={orderDirection}
                    onClick={() =>
                      setOrderDirection((prev) =>
                        prev === "asc" ? "desc" : "asc"
                      )
                    }
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? "#fff"
                          : theme.palette.primary.contrastText,
                    }}
                  >
                    {viewMode === "employee"
                      ? SELECTOR_TABLE.EMPLOYEES
                      : SELECTOR_TABLE.SCHEDULES || "Horarios"}
                  </TableSortLabel>
                </TableCell>
                {currentWeek.map(({ day, date }) => (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      ...tableCellStyles(isSmallScreen),
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "#111"
                          : theme.palette.primary.main,
                      color:
                        theme.palette.mode === "dark"
                          ? "#fff"
                          : theme.palette.primary.contrastText,
                      position: "relative",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      minHeight: viewMode === "schedule" ? "40px" : "auto",
                      height: viewMode === "schedule" ? "40px" : "auto",
                    }}
                  >
                    {`${translateDayToAbrevSpanish(
                      day as EnglishDayOfWeek
                    )} ${formatHeaderDate(date)}`}
                  </TableCell>
                ))}
                {viewMode === "employee" &&
                  permissions?.includes(
                    PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                  ) && (
                    <>
                      <TableCell
                        sx={{
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#111"
                              : theme.palette.primary.main,
                          color:
                            theme.palette.mode === "dark"
                              ? "#fff"
                              : theme.palette.primary.contrastText,
                          position: "relative",
                          zIndex: 1,
                        }}
                      />
                      <TableCell
                        align="center"
                        sx={{
                          ...tableCellStyles(isSmallScreen),
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "#111"
                              : theme.palette.primary.main,
                          color:
                            theme.palette.mode === "dark"
                              ? "#fff"
                              : theme.palette.primary.contrastText,
                          position: "relative",
                          zIndex: 1,
                        }}
                        colSpan={2}
                      >
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={selectedPeriod}
                            onChange={(e) =>
                              setSelectedPeriod(e.target.value as PeriodType)
                            }
                            displayEmpty
                            input={
                              <OutlinedInput
                                notched={false}
                                label="Periodo"
                                sx={{
                                  backgroundColor: theme.palette.primary.dark,
                                  color:
                                    theme.palette.mode === "dark"
                                      ? "#fff"
                                      : theme.palette.primary.contrastText,
                                  border: "none",
                                  boxShadow: "none",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      border: "none",
                                    },
                                }}
                              />
                            }
                            sx={{
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? "#fff"
                                  : theme.palette.background.paper,
                              color:
                                theme.palette.mode === "dark"
                                  ? "#fff"
                                  : theme.palette.background.paper,
                              border: "none",
                              boxShadow: "none",
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  border: "none",
                                },
                            }}
                            renderValue={(selected) => {
                              switch (selected) {
                                case "weekly":
                                  return (
                                    <>
                                      <CalendarTodayIcon
                                        sx={{
                                          fontSize: 18,
                                          mr: 1,
                                          color: "primary.main",
                                          verticalAlign: "middle",
                                        }}
                                      />
                                      {SELECTOR_TABLE.WEEKLY}
                                    </>
                                  );
                                case "biweekly":
                                  return (
                                    <>
                                      <DateRangeIcon
                                        sx={{
                                          fontSize: 18,
                                          mr: 1,
                                          color: "primary.main",
                                          verticalAlign: "middle",
                                        }}
                                      />
                                      {SELECTOR_TABLE.BIWEEKLY}
                                    </>
                                  );
                                case "monthly":
                                  return (
                                    <>
                                      <CalendarMonthIcon
                                        sx={{
                                          fontSize: 18,
                                          mr: 1,
                                          color: "primary.main",
                                          verticalAlign: "middle",
                                        }}
                                      />
                                      {SELECTOR_TABLE.MONTHLY}
                                    </>
                                  );
                                default:
                                  return "";
                              }
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 320,
                                  overflowY: "auto",
                                },
                              },
                            }}
                          >
                            <MenuItem value="weekly">
                              <CalendarTodayIcon
                                sx={{
                                  fontSize: 18,
                                  mr: 1,
                                  color: "primary.main",
                                  verticalAlign: "middle",
                                }}
                              />
                              {SELECTOR_TABLE.WEEKLY}
                            </MenuItem>
                            <MenuItem value="biweekly">
                              <DateRangeIcon
                                sx={{
                                  fontSize: 18,
                                  mr: 1,
                                  color: "primary.main",
                                  verticalAlign: "middle",
                                }}
                              />
                              {SELECTOR_TABLE.BIWEEKLY}
                            </MenuItem>
                            <MenuItem value="monthly">
                              <CalendarMonthIcon
                                sx={{
                                  fontSize: 18,
                                  mr: 1,
                                  color: "primary.main",
                                  verticalAlign: "middle",
                                }}
                              />
                              {SELECTOR_TABLE.MONTHLY}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </>
                  )}
              </TableRow>
            </TableHead>
            <TableBody>
              {viewMode === "employee" ? (
                paginatedEmployees.map((employee, rowIndex) => (
                  <TableRow key={employee.id} sx={tableRowBackground(rowIndex)}>
                    <TableCell
                      sx={Object.assign(
                        {},
                        employeeColumnCellStyles(isSmallScreen),
                        tableCellBackground(rowIndex, false)
                      )}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={employeeCellBoxStyles(isSmallScreen)}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={totalHoursTypographyStyles}
                        >
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        {permissions?.includes(
                          PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                        ) && (
                          <Tooltip title="Ver información" arrow>
                            <span>
                              <IconButton
                                size="medium"
                                sx={{
                                  color: "primary.main",
                                  backgroundColor: "transparent",
                                  "&:hover": {
                                    backgroundColor: "primary.lighter",
                                    boxShadow: 1,
                                  },
                                  transition: "background 0.2s",
                                }}
                                onClick={() =>
                                  setOpenInfoDialogEmployee(employee)
                                }
                              >
                                <InfoOutlinedIcon fontSize="medium" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    {currentWeek.map(({ day, date }) => {
                      const scheduleData = getScheduleCellData(
                        employee,
                        day,
                        date,
                        schedules,
                        hoursWorked
                      );

                      return (
                        <TableCell
                          key={day}
                          sx={tableCellBackground(rowIndex, isToday(date))}
                        >
                          <FormControl fullWidth>
                            <Select
                              value={scheduleData.finalSelectedLabel}
                              onChange={(event: SelectChangeEvent<string>) =>
                                handleChange(event, employee.id, new Date(date))
                              }
                              disabled={
                                !permissions?.includes(
                                  PERMISSIONS.EDIT_EMPLOYEE_ROLES
                                )
                              }
                              renderValue={(selected) => (
                                <span style={{ fontSize: "0.85rem" }}>
                                  {selected}
                                </span>
                              )}
                              input={
                                <OutlinedInput
                                  notched={false}
                                  label="Ubicación"
                                />
                              }
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 320,
                                    overflowY: "auto",
                                  },
                                },
                              }}
                            >
                              <ListSubheader
                                sx={listSubheaderStyles("primary.main")}
                              >
                                <LocationOnOutlinedIcon
                                  sx={{ mr: 1, color: "primary.main" }}
                                  fontSize="small"
                                />
                                {SELECTOR_TABLE.LOCATIONS}
                              </ListSubheader>
                              {scheduleData.options
                                .filter((option) => !option.specialSchedule)
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((option) => (
                                  <MenuItem
                                    key={option.id}
                                    value={option.label}
                                    sx={menuItemStyles}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              <ListSubheader
                                sx={listSubheaderStyles("warning.main")}
                              >
                                <StarOutlineOutlinedIcon
                                  sx={{ mr: 1, color: "warning.main" }}
                                  fontSize="small"
                                />
                                {SELECTOR_TABLE.SPECIAL_SCHEDULES}
                              </ListSubheader>
                              {scheduleData.options
                                .filter((option) => option.specialSchedule)
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((option) => (
                                  <MenuItem
                                    key={option.id}
                                    value={option.label}
                                    sx={menuItemStyles}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              {permissions?.includes(
                                PERMISSIONS.CREATE_SCHEDULES
                              ) && (
                                <MenuItem
                                  value={"Other"}
                                  onClick={() => navigate("/schedules")}
                                >
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
                      PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                    ) && (
                      <>
                        <TableCell
                          align="center"
                          sx={{
                            padding: isSmallScreen ? "8px" : "16px",
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Tooltip title="Ajustar horas" arrow>
                              <span>
                                <IconButton
                                  size="medium"
                                  disabled={
                                    !hasWorkedCurrentWeekForEmployee(employee)
                                  }
                                  sx={{
                                    color: hasWorkedCurrentWeekForEmployee(
                                      employee
                                    )
                                      ? "warning.main"
                                      : "grey.400",
                                    backgroundColor: "transparent",
                                    "&:hover": {
                                      backgroundColor: "warning.lighter",
                                      boxShadow: 1,
                                    },
                                    transition: "background 0.2s",
                                  }}
                                  onClick={() =>
                                    setOpenAdjustDialogEmployee(employee)
                                  }
                                >
                                  <MoreTimeIcon fontSize="medium" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: isSmallScreen ? "8px" : "16px",
                            position: isSmallScreen ? "static" : "sticky",
                            right: 0,
                            zIndex: 2,
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={3.5}
                            alignItems="center"
                            justifyContent="center"
                            sx={stackTotalHoursStyles}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={totalHoursTypographyStyles}
                            >
                              {resultTotalHours(employee)}{" "}
                              {SELECTOR_TABLE.HOURS}
                            </Typography>
                            <Tooltip
                              title={SELECTOR_TABLE.OVERTIME_HOURS}
                              arrow
                            >
                              <span>
                                <Badge
                                  badgeContent={resultOvertime(employee)}
                                  max={9999999}
                                  color={getOvertimeBadgeColor(
                                    resultOvertime(employee)
                                  )}
                                  showZero
                                  overlap="circular"
                                  anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                  }}
                                  sx={{
                                    "& .MuiBadge-badge": {
                                      minWidth: 22,
                                      height: 22,
                                      fontSize: "0.95rem",
                                      fontWeight: 500,
                                      borderRadius: "8px",
                                      right:
                                        String(resultOvertime(employee))
                                          .length > 1
                                          ? -25
                                          : -10,
                                      top: -10,
                                      transform: "none",
                                      padding: "0 6px",
                                    },
                                  }}
                                >
                                  <AccessTimeRoundedIcon
                                    sx={{ color: "primary.main", fontSize: 28 }}
                                  />
                                </Badge>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                allSchedules.map((schedule, rowIndex) => (
                  <TableRow key={schedule.id} sx={tableRowBackground(rowIndex)}>
                    <TableCell
                      sx={Object.assign(
                        {},
                        employeeColumnCellStyles(isSmallScreen),
                        tableCellBackground(rowIndex, false)
                      )}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={totalHoursTypographyStyles}
                        component="span"
                      >
                        {schedule.label}
                      </Typography>
                    </TableCell>
                    {currentWeek.map(({ day, date }) => {
                      const assignedEmployees = getEmployeesForScheduleAndDay(
                        schedule.id,
                        date,
                        filteredEmployees,
                        hoursWorked
                      );
                      return (
                        <TableCell
                          key={day}
                          sx={tableCellBackground(rowIndex, isToday(date))}
                        >
                          <FormControl fullWidth>
                            <Select
                              multiple
                              displayEmpty
                              value={assignedEmployees.map((e) => e.id)}
                              onChange={(event) =>
                                handleScheduleEmployeesChange(
                                  event,
                                  schedule.id,
                                  date
                                )
                              }
                              renderValue={(selected) => {
                                // Check if selected is empty or null/undefined
                                const selectedArray = selected as number[];
                                if (!selectedArray || selectedArray.length === 0) {
                                  return (
                                    <span
                                      style={{
                                        color: theme.palette.text.disabled,
                                        fontStyle: "italic",
                                        fontSize: "0.85rem",
                                        fontWeight: 400,
                                      }}
                                    >
                                      {SELECTOR_TABLE.UNASSIGNED}
                                    </span>
                                  );
                                }
                                
                                const names = selectedArray
                                  .map((id) => {
                                    const emp = filteredEmployees.find(
                                      (e) => e.id === id
                                    );
                                    return emp
                                      ? `${emp.firstName} ${emp.lastName}`
                                      : "";
                                  })
                                  .filter(Boolean);
                                
                                return (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {names.map((name, index) => (
                                      <Typography 
                                        key={index} 
                                        variant="body2" 
                                        component="span"
                                        sx={{
                                          fontSize: "0.85rem",
                                          fontWeight: 500,
                                          fontStyle: "normal",
                                        }}
                                      >
                                        {name}
                                      </Typography>
                                    ))}
                                  </Box>
                                );
                              }}
                              disabled={
                                !permissions?.includes(
                                  PERMISSIONS.EDIT_EMPLOYEE_ROLES
                                )
                              }
                              input={
                                <OutlinedInput
                                  notched={false}
                                />
                              }
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 320,
                                    overflowY: "auto",
                                  },
                                },
                                onClose: handleMenuClose,
                              }}
                              onOpen={handleMenuOpen}
                            >
                              {/* Search Bar inside menu - Sticky */}
                              <Box 
                                sx={{ 
                                  p: 1, 
                                  borderBottom: 1, 
                                  borderColor: 'divider',
                                  position: 'sticky',
                                  top: 0,
                                  backgroundColor: theme.palette.background.paper,
                                  zIndex: 1,
                                }}
                                onClick={handleSearchClick}
                              >
                                <SearchBarComponent
                                  value={employeeSearchTerm}
                                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                                  placeholder="Buscar empleado..."
                                  fullWidth
                                />
                              </Box>
                              
                              {filteredEmployees
                                .filter((employee) => {
                                  if (!employeeSearchTerm) return true;
                                  const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
                                  return fullName.includes(employeeSearchTerm.toLowerCase());
                                })
                                .sort((a, b) => {
                                  const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
                                  const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
                                  return nameA.localeCompare(nameB);
                                })
                                .map((employee) => {
                                  const assignedEmployees = getEmployeesForScheduleAndDay(
                                    schedule.id,
                                    date,
                                    filteredEmployees,
                                    hoursWorked
                                  );
                                  const isSelected = assignedEmployees.some(e => e.id === employee.id);
                                  
                                  return (
                                    <MenuItem 
                                      key={employee.id} 
                                      value={employee.id} 
                                      sx={{
                                        ...menuItemStyles,
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        '& .MuiCheckbox-root': {
                                          marginRight: 1,
                                        },
                                      }}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        size="small"
                                        sx={{
                                          color: theme.palette.primary.main,
                                          '&.Mui-checked': {
                                            color: theme.palette.primary.main,
                                          },
                                          '&.MuiCheckbox-indeterminate': {
                                            color: theme.palette.primary.main,
                                          },
                                        }}
                                      />
                                      <span style={{ textAlign: 'left', flex: 1 }}>
                                        {employee.firstName} {employee.lastName}
                                      </span>
                                    </MenuItem>
                                  );
                                })}
                            </Select>
                          </FormControl>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          {!isSmallScreen && (
            <Typography variant="body2" sx={{ ml: 2 }}>
              {renderPeriodFooter(
                "weekly", // Assuming default to weekly for now, as selectedPeriod is removed
                currentWeek,
                weekNumber,
                biweekNumber,
                month,
                year,
                multiplePeriods
              )}
            </Typography>
          )}
          <div ref={paginationRef}>
            <TablePagination
              className="pagination"
              rowsPerPageOptions={rowsPerPageOptions}
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
              ActionsComponent={PaginationComponent}
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? "#fff"
                    : theme.palette.primary.contrastText,
                ".MuiTablePagination-toolbar": {
                  backgroundColor: "transparent",
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-input, .MuiTablePagination-displayedRows":
                  {
                    color:
                      theme.palette.mode === "dark"
                        ? "#fff"
                        : theme.palette.primary.contrastText,
                  },
                ".MuiSvgIcon-root": {
                  color:
                    theme.palette.mode === "dark"
                      ? "#fff"
                      : theme.palette.primary.contrastText,
                },
              }}
            />
          </div>
        </Box>
      </Paper>
      <DialogComponent
        open={!!openAdjustDialogEmployee}
        onClose={() => setOpenAdjustDialogEmployee(null)}
        title={SELECTOR_TABLE.ADJUST_HOURS}
        subtitle={getDialogTitle(openAdjustDialogEmployee)}
        hideActions
        paperSx={addDialogPaperSx as object}
        icon={<MoreTimeIcon color="warning" />}
      >
        <AdjustHoursDialog
          onCancel={() => setOpenAdjustDialogEmployee(null)}
          employee={openAdjustDialogEmployee}
          selectedPeriod={viewMode === "employee" ? "weekly" : "monthly"} // Assuming default to weekly for now, as selectedPeriod is removed
          timeAdjustment={timeAdjustment}
          setTimeAdjustment={setTimeAdjustment}
          getDialogTitle={getDialogTitle}
          getPeriodMessage={getPeriodMessage}
          getCurrentHoursDisplay={getCurrentHoursDisplay}
          getTimeAdjustmentError={getTimeAdjustmentError}
          getTimeAdjustmentIconColor={getTimeAdjustmentIconColor}
          handleAdjustTime={handleAdjustTime}
          weekNumber={weekNumber}
          biweekNumber={biweekNumber}
          month={month}
          year={year}
          weeklySummaries={weeklySummaries}
          biweeklySummaries={biweeklySummaries}
          monthlySummaries={monthlySummaries}
          isSmallScreen={isSmallScreen}
        />
      </DialogComponent>
      <DialogComponent
        open={!!openInfoDialogEmployee}
        onClose={() => setOpenInfoDialogEmployee(null)}
        title={SELECTOR_TABLE.SUMMARY_TITLE}
        subtitle={getDialogTitle(openInfoDialogEmployee)}
        hideActions
        paperSx={addDialogPaperSx as object}
        icon={<InfoOutlinedIcon color="info" />}
      >
        <WorkedHoursSummaryDialog
          onCancel={() => setOpenInfoDialogEmployee(null)}
          employee={openInfoDialogEmployee}
          summaryTab={summaryTab}
          setSummaryTab={setSummaryTab}
          getEmployeeWeeklyHours={getEmployeeWeeklyHours}
          getEmployeeBiweeklyHours={getEmployeeBiweeklyHours}
          getEmployeeMonthlyHours={getEmployeeMonthlyHours}
          getEmployeeOvertime={getEmployeeOvertime}
          currentWeekNumber={weekNumber}
          currentBiweekNumber={biweekNumber}
          currentMonth={month}
          currentYear={year}
          theme={theme}
        />
      </DialogComponent>
    </>
  );
};

SelectorTableComponent.propTypes = {
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
  rowsPerPage: PropTypes.number,
  setRowsPerPage: PropTypes.func,
  setViewMode: PropTypes.func.isRequired,
};

export default SelectorTableComponent;
