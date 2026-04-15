import React, { useMemo, useState, useRef, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { PlusCircle } from "lucide-react";
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
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  SelectChangeEvent,
  Stack,
  OutlinedInput,
  IconButton,
} from "@mui/material";
import PaginationComponent from "../Pagination/Pagination.component";
import {
  formatHeaderDate,
  getCurrentWeekDates,
  getInvolvedPeriods,
} from "../../../utils/dates";
import { translateDayToAbrevSpanish } from "../../../utils/string";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import {
  TABLE,
  PERMISSIONS,
  SELECTOR_TABLE,
  OVERTIME,
} from "../../../constants/constants";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import { ScheduleCellDropdown } from "./components/ScheduleCellDropdown";
import { EmployeeCellDropdown } from "./components/EmployeeCellDropdown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddScheduleForm from "../../../pages/Forms/AddScheduleForm";
import MANAGEMENT from "../../../constants/management.constants";
import { createSchedule } from "../../../store/slices/schedulesSlice";
import {
  stickyHeaderBoxStyles,
  headerFlexBoxStyles,
  tableContainerStyles,
  paperStyles,
  tableRowBackground,
  tableCellBackground,
  employeeColumnCellStyles,
  tableCellStyles,
  boldTypographyStyles,
  employeeCellBoxStyles,
} from "./SelectorTable.styles";

// Import helper functions
import {
  calculateTotalHours,
  calculateOvertime,
  sortEmployeesByName,
  paginateEmployees,
  renderPeriodHeader,
  renderPeriodFooter,
  getPeriodMessage,
  getScheduleCellData,
  isToday,
  getDialogTitle,
  getCurrentHoursDisplay,
  getTimeAdjustmentError,
  getTimeAdjustmentIconColor,
} from "./helpers";
import AdjustHoursDialog from "../../../pages/Forms/AdjustHoursDialog";
import WorkedHoursSummaryDialog from "../../../pages/Forms/WorkedHoursSummaryDialog";
import DialogComponent from "../../Dialog/Dialog.component";
import { adjustDialogPaperSx } from "../../../pages/Forms/AdjustHoursDialog/styles";
import { summaryDialogPaperSx } from "../../../pages/Forms/WorkedHoursSummaryDialog/styles";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import {
  createOrUpdateHoursWorked,
  deleteHoursWorked, // <-- importa la acción de borrado
} from "../../../store/slices/hoursWorkedSlice";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

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
    date: Date
  ) => void;
  handleAdjustTime: (
    employeeId: number,
    condition: "add" | "subtract",
    timeAdjustment: number
  ) => void;
  recalculateEmployeeWeeklySummary?: (
    employeeId: number,
    date: Date,
    newHoursWorkedEntry?: {
      employeeId: number;
      date: string;
      scheduleId: number;
    }
  ) => Promise<void>;
  permissions?: string[];
  rowsPerPage?: number;
  setRowsPerPage?: (rows: number) => void;
  viewMode: "employee" | "schedule";
  setViewMode: React.Dispatch<React.SetStateAction<"employee" | "schedule">>;
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
  recalculateEmployeeWeeklySummary,
  permissions,
  rowsPerPage: rowsPerPageProp,
  setRowsPerPage: setRowsPerPageProp,
  viewMode,
  setViewMode,
}) => {
  const [timeAdjustment, setTimeAdjustment] = useState(0);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(5);
  const [openAddScheduleModal, setOpenAddScheduleModal] = useState(false);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const rowsPerPage =
    rowsPerPageProp !== undefined ? rowsPerPageProp : localRowsPerPage;
  const setRowsPerPage =
    setRowsPerPageProp !== undefined ? setRowsPerPageProp : setLocalRowsPerPage;

  const handleCreateSchedule = async (newSchedule: Omit<Schedule, "id">) => {
    try {
      setIsCreatingSchedule(true);
      await dispatch(createSchedule(newSchedule));
      setOpenAddScheduleModal(false);
    } catch (error) {
      // Error handling
    } finally {
      setIsCreatingSchedule(false);
    }
  };
  const [openAdjustDialogEmployee, setOpenAdjustDialogEmployee] =
    useState<Employee | null>(null);
  const [openInfoDialogEmployee, setOpenInfoDialogEmployee] =
    useState<Employee | null>(null);
  const [summaryTab, setSummaryTab] = useState<
    "weekly" | "biweekly" | "monthly" | "overtime"
  >("weekly");
  type PeriodType = "weekly" | "biweekly" | "monthly";
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("weekly");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const theme = useTheme();
  const [employeeSearchTerms, setEmployeeSearchTerms] = useState<Record<string, string>>({});

  const getSearchKey = (scheduleId: number, date: string) => `${scheduleId}-${date}`;

  const handleSearchChange = useCallback(
    (scheduleId: number, date: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmployeeSearchTerms(prev => ({
        ...prev,
        [getSearchKey(scheduleId, date)]: e.target.value
      }));
    },
    []
  );

  // Handle menu state
  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // Handle ESC key to close search
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        handleMenuClose();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableHeadRef = useRef<HTMLTableSectionElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const currentWeek = useMemo(
    () => getCurrentWeekDates(weekOffset),
    [weekOffset]
  );
  const multiplePeriods = getInvolvedPeriods(currentWeek);

  const dispatch = useDispatch<AppDispatch>();

  // Use helper functions for employee data processing
  const sortedEmployees = useMemo(() => {
    return sortEmployeesByName(filteredEmployees, orderDirection);
  }, [filteredEmployees, orderDirection]);

  const paginatedEmployees = paginateEmployees(
    sortedEmployees,
    page,
    rowsPerPage
  );

  // Use helper functions for hours calculations
  // 2. Usar selectedPeriod en lugar de 'weekly' en las funciones de totales y overtime
  const resultTotalHours = useCallback((employee: Employee) => {
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
      multiplePeriods
    );
  }, [selectedPeriod, currentWeek, weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries, multiplePeriods]);

  const resultOvertime = useCallback((employee: Employee) => {
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
      multiplePeriods
    );
  }, [selectedPeriod, currentWeek, weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries, multiplePeriods]);

  const hasWorkedCurrentWeekForEmployee = useCallback((employee: Employee): boolean => {
    const summary = weeklySummaries.find(
      (summary) =>
        summary.employeeId === employee.id &&
        summary.weekNumber === weekNumber &&
        summary.year === year
    );
    return summary ? Number(summary.totalHours) > 0 : false;
  }, [weekNumber, year, weeklySummaries]);

  // Use helper function for rows per page options
  const rowsPerPageOptions = useMemo(() => {
    const defaultOptions = [5, 10, 25, 50, 100];
    const total = sortedEmployees.length;
    
    // Generate dynamic options based on total
    const dynamicOptions: number[] = [];
    let current = 5;
    while (current < total) {
      dynamicOptions.push(current);
      current *= 2;
    }
    if (total > 0) {
      dynamicOptions.push(total);
    }
    
    // Combine with default options and remove duplicates
    const allOptions = Array.from(new Set([...defaultOptions, ...dynamicOptions, rowsPerPage]));
    return allOptions.filter((opt) => opt <= total || total === 0).sort((a, b) => a - b);
  }, [rowsPerPage, sortedEmployees.length]);

  // Helper functions for tabbed summary dialog
  const calculateOvertimeHours = (totalHours: number, threshold: number) =>
    totalHours > threshold ? totalHours - threshold : 0;

  const getEmployeeWeeklyHours = useCallback((id: number) => {
    const summary = weeklySummaries.find(
      (s) =>
        s.employeeId === id && s.weekNumber === weekNumber && s.year === year
    );
    return summary ? summary.totalHours : 0;
  }, [weeklySummaries, weekNumber, year]);
  const getEmployeeBiweeklyHours = useCallback((id: number) => {
    const summary = biweeklySummaries.find(
      (s) =>
        s.employeeId === id &&
        s.biweekNumber === biweekNumber &&
        s.year === year
    );
    return summary ? summary.totalHours : 0;
  }, [biweeklySummaries, biweekNumber, year]);
  const getEmployeeMonthlyHours = useCallback((id: number) => {
    const summary = monthlySummaries.find(
      (s) => s.employeeId === id && s.month === month && s.year === year
    );
    return summary ? summary.totalHours : 0;
  }, [monthlySummaries, month, year]);
  const getEmployeeWeeklyOvertime = (id: number) =>
    calculateOvertimeHours(getEmployeeWeeklyHours(id), OVERTIME.WEEKLY);
  const getEmployeeBiweeklyOvertime = (id: number) =>
    calculateOvertimeHours(getEmployeeBiweeklyHours(id), OVERTIME.BIWEEKLY);
  const getEmployeeMonthlyOvertime = (id: number) =>
    calculateOvertimeHours(getEmployeeMonthlyHours(id), OVERTIME.MONTHLY);

  // Helper para obtener empleados asignados a un schedule en un día
  const getEmployeesForScheduleAndDay = (
    scheduleId: number,
    date: string,
    employees: Employee[],
    hoursWorked: HoursWorked[]
  ) => {
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
  };

  // Agrupa los schedules por label (ignorando mayúsculas/tildes)
  const groupedSchedules = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
    const groups: Record<
      string,
      { label: string; dayToSchedule: Record<string, Schedule> }
    > = {};
    for (const schedule of schedules) {
      const normLabel = normalize(schedule.label);
      if (!groups[normLabel]) {
        groups[normLabel] = { label: schedule.label, dayToSchedule: {} };
      }
      for (const day of schedule.days) {
        // Si ya hay un schedule para ese día, prioriza el primero encontrado
        if (!groups[normLabel].dayToSchedule[day]) {
          groups[normLabel].dayToSchedule[day] = schedule;
        }
      }
    }
    // Ordena: primero los que no son especiales, luego especiales, y dentro de cada grupo, alfabéticamente
    return Object.values(groups).sort((a, b) => {
      // Busca si algún día de la semana es especial
      const aSpecial = Object.values(a.dayToSchedule).some(
        (s) => s.specialSchedule
      );
      const bSpecial = Object.values(b.dayToSchedule).some(
        (s) => s.specialSchedule
      );
      if (aSpecial !== bSpecial) return aSpecial ? 1 : -1;
      return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
    });
  }, [schedules]);

  // Handler to change the assigned employees to a schedule in one day
  const handleScheduleEmployeesChange = (
    value: number[],
    scheduleId: number,
    date: string
  ) => {
    const selectedEmployeeIds = value;
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
        // Get the schedule object
        const schedule = schedules.find(s => s.id === scheduleId);
        if (!schedule) return;
        
        // Use the same logic as handleChange in employee view
        const dayDate = new Date(date);
        const dayNameEnglish = dayDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        
        // Check if the schedule includes this specific day
        if (schedule.days.includes(dayNameEnglish)) {
          const hoursWorkedEntry = {
            employeeId: empId,
            scheduleId,
            date: new Date(date).toISOString(),
          };
          
          dispatch(createOrUpdateHoursWorked(hoursWorkedEntry)).then(() => {
            // Recalculate weekly summary for this employee
            if (recalculateEmployeeWeeklySummary) {
              recalculateEmployeeWeeklySummary(empId, new Date(date), hoursWorkedEntry);
            }
          });
        }
      }
    });
    // Remove unassigned
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
          dispatch(deleteHoursWorked(record.id)).then(() => {
            // Recalculate weekly summary for this employee after deletion
            if (recalculateEmployeeWeeklySummary) {
              recalculateEmployeeWeeklySummary(empId, new Date(date));
            }
          });
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
          sx={{
            ...tableContainerStyles,
            maxHeight: "100%",
            border: "none !important",
            outline: "none !important",
            boxShadow: "none !important",
          }}
          ref={tableContainerRef}
        >
          <Table
            stickyHeader
            aria-label="sticky table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              border: "none !important",
              "& td, & th": {
                border: "none !important",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
              "& th:first-of-type, & td:first-of-type": {
                width: viewMode === "employee" ? "12%" : "15%",
                minWidth: viewMode === "employee" ? "140px" : "120px",
              },
              ...(viewMode === "employee" && {
                "& th:nth-of-type(2), & td:nth-of-type(2)": {
                  width: "5%",
                  minWidth: "50px",
                },
              }),
              ...(viewMode === "employee"
                ? {
                    "& th:nth-of-type(n+3):nth-of-type(-n+9), & td:nth-of-type(n+3):nth-of-type(-n+9)": {
                      width: "11.8%",
                      minWidth: "80px",
                    },
                  }
                : {
                    "& th:nth-of-type(n+2):nth-of-type(-n+8), & td:nth-of-type(n+2):nth-of-type(-n+8)": {
                      width: "12.14%",
                      minWidth: "100px",
                    },
                  }),
              "& .MuiTableCell-stickyHeader": {
                backgroundColor: "#000000",
                color: "#fff",
                zIndex: 15,
                position: "sticky",
                top: 0,
                border: "none !important",
                outline: "none !important",
                boxShadow: "none !important",
              },
            }}
          >
            <TableHead ref={tableHeadRef} sx={{ height: "36px", position: "sticky", top: 0, zIndex: 50, backgroundColor: "#000", border: "none !important", "& th": { border: "none !important" } }}>
              <TableRow>
                <TableCell
                  className="employee-column"
                  sx={{
                    ...employeeColumnCellStyles(isSmallScreen),
                    backgroundColor: "#000000",
                    color: "#fff",
                    position: "sticky",
                    left: 0,
                    top: 0,
                    zIndex: 60,
                    padding: "4px 8px",
                    height: "36px",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#333",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode(viewMode === "employee" ? "schedule" : "employee");
                      }}
                    >
                      <IconButton
                        aria-label="Cambiar vista"
                        title={viewMode === "employee" ? SELECTOR_TABLE.EMPLOYEES : SELECTOR_TABLE.SCHEDULES}
                        sx={{
                          backgroundColor: "transparent",
                          padding: "4px",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            backgroundColor: "transparent",
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <SwapHorizIcon sx={{ fontSize: "1.2rem", color: "#fff" }} />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          display: { xs: 'none', sm: 'block' },
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          letterSpacing: "-0.01em",
                          color: "#fff",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {viewMode === "employee"
                          ? SELECTOR_TABLE.EMPLOYEES
                          : SELECTOR_TABLE.SCHEDULES}
                      </Typography>
                    </Box>
                    <TableSortLabel
                      direction={orderDirection}
                      onClick={() =>
                        setOrderDirection((prev) =>
                          prev === "asc" ? "desc" : "asc"
                        )
                      }
                      sx={{
                        color: "#fff",
                      }}
                    />
                  </Box>
                </TableCell>
                {viewMode === "employee" && permissions?.includes(
                  PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                ) && (
                  <TableCell
                    align="center"
                    sx={{
                      ...tableCellStyles(isSmallScreen),
                      backgroundColor: "#000000",
                      color: "#fff",
                      padding: "4px 8px",
                      height: "36px",
                      width: "60px",
                      minWidth: "60px",
                    }}
                  />
                )}

                {currentWeek.map(({ day, date, isoDate }) => {
                  const today = new Date().toDateString() === new Date(isoDate).toDateString();
                  return (
                    <TableCell
                      key={day}
                      align="center"
                      sx={{
                        ...tableCellStyles(isSmallScreen),
                        backgroundColor: "#000000",
                        color: "#fff",
                        whiteSpace: "nowrap",
                        padding: "4px 8px",
                        height: "36px",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          backgroundColor: "#333",
                        },
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Typography
                          sx={{
                            color: today ? "#00BCD4" : "#fff",
                            fontWeight: today ? 700 : 600,
                            fontSize: today ? "0.85rem" : "0.8rem",
                            letterSpacing: today ? "0.05em" : "normal",
                          }}
                        >
                          {`${translateDayToAbrevSpanish(
                            day as EnglishDayOfWeek
                          )} ${formatHeaderDate(date)}`}
                        </Typography>
                        {today && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: '-2px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: '#00BCD4',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
                {viewMode === "employee" && permissions?.includes(
                  PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                ) && (
                  <TableCell
                      align="center"
                      sx={{
                        ...tableCellStyles(isSmallScreen),
                        backgroundColor: "#000000",
                        color: "#fff",
                        padding: "0 8px",
                        height: "36px",
                        verticalAlign: "middle",
                      }}
                      colSpan={2}
                    >
                        <FormControl size="small" sx={{ minWidth: 100, height: "36px", m: 0, backgroundColor: "transparent", mt: "-8px" }}>
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
                                  backgroundColor: theme.palette.mode === 'light' ? "#000000 !important" : "transparent !important",
                                  color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary,
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  height: "36px",
                                  borderRadius: 0,
                                  boxShadow: "none",
                                  transition: "none",
                                  "& .MuiOutlinedInput-input": {
                                    color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary,
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    padding: "2px 28px 6px 8px !important",
                                    lineHeight: "1.2",
                                  },
                                  "& fieldset": {
                                    borderColor: "transparent",
                                    borderWidth: 0,
                                    border: "none",
                                    borderRadius: 0,
                                  },
                                  "&:hover": {
                                    boxShadow: "none",
                                    "& fieldset": {
                                      borderColor: "transparent",
                                    },
                                  },
                                  "&.Mui-focused": {
                                    boxShadow: "none",
                                    "& fieldset": {
                                      borderColor: "transparent",
                                      borderWidth: 0,
                                      border: "none",
                                    },
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: "transparent !important",
                                  },
                                  "& .MuiInputBase-root": {
                                    backgroundColor: "transparent !important",
                                  },
                                }}
                              />
                            }
                            sx={{
                              backgroundColor: theme.palette.mode === 'light' ? "#000000" : "transparent",
                              color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary,
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              borderRadius: 0,
                              height: "36px",
                              "& .MuiSelect-select": {
                                color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary,
                                backgroundColor: theme.palette.mode === 'light' ? "#000000 !important" : "transparent !important",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                padding: "2px 28px 6px 8px !important",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                borderRadius: 0,
                                minHeight: "36px !important",
                                height: "36px",
                                lineHeight: "1.2",
                                justifyContent: "flex-start",
                              },
                              "& .MuiSelect-icon": {
                                color: "rgba(255,255,255,0.7)",
                                fontSize: "1.1rem",
                                right: "4px",
                                top: "50%",
                                transform: "translateY(-50%)",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "transparent",
                                borderWidth: 0,
                                border: "none",
                                borderRadius: 0,
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "transparent",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "transparent",
                                borderWidth: 0,
                                border: "none",
                              },
                              "&.Mui-active .MuiOutlinedInput-notchedOutline": {
                                borderColor: "transparent",
                                borderWidth: 0,
                                border: "none",
                              },
                              "& .MuiInputBase-root": {
                                backgroundColor: "transparent !important",
                              },
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "transparent !important",
                              },
                              "&:hover": {
                                backgroundColor: "transparent",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "transparent",
                              },
                              "&.Mui-active": {
                                backgroundColor: "transparent",
                              },
                            }}
                            MenuProps={{
                              anchorOrigin: { horizontal: "center", vertical: "bottom" },
                              transformOrigin: { horizontal: "center", vertical: "top" },
                              marginThreshold: 0,
                              PaperProps: {
                                elevation: 0,
                                sx: {
                                  maxHeight: 280,
                                  overflowY: "auto",
                                  mt: -0.5,
                                  minWidth: 200,
                                  background: theme.palette.mode === 'light' ? '#000000' : '#000000',
                                  backdropFilter: "none",
                                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                  borderRadius: "16px",
                                  boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
                                  pr: 0,
                                  "& .MuiList-root": {
                                    padding: "4px",
                                  },
                                  "& .MuiMenuItem-root": {
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    margin: "2px 0",
                                    color: theme.palette.mode === 'light' ? '#fff' : '#fff',
                                    backgroundColor: "transparent",
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    minHeight: "40px",
                                    gap: "8px",
                                    "&:hover": {
                                      backgroundColor: 'rgba(255,255,255,0.08)',
                                    },
                                    "&.Mui-selected": {
                                      backgroundColor: 'rgba(255,255,255,0.12)',
                                      color: '#fff',
                                    },
                                    "&.Mui-selected:hover": {
                                      backgroundColor: 'rgba(255,255,255,0.16)',
                                    },
                                  },
                                },
                              },
                            }}
                            renderValue={(selected) => {
                              switch (selected) {
                                case "weekly":
                                  return (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: "100%", py: 0 }}>
                                      <Box sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "3px",
                                        backgroundColor: theme.palette.mode === 'light' ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}>
                                        <CalendarTodayIcon sx={{ fontSize: 10, color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary }} />
                                      </Box>
                                      <span style={{ color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary, fontSize: "0.85rem", fontWeight: 600, lineHeight: "1.2", display: "flex", alignItems: "center" }}>
                                        {SELECTOR_TABLE.WEEKLY}
                                      </span>
                                    </Box>
                                  );
                                case "biweekly":
                                  return (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: "100%", py: 0 }}>
                                      <Box sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "3px",
                                        backgroundColor: theme.palette.mode === 'light' ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}>
                                        <DateRangeIcon sx={{ fontSize: 10, color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary }} />
                                      </Box>
                                      <span style={{ color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary, fontSize: "0.85rem", fontWeight: 600, lineHeight: "1.2", display: "flex", alignItems: "center" }}>
                                        {SELECTOR_TABLE.BIWEEKLY}
                                      </span>
                                    </Box>
                                  );
                                case "monthly":
                                  return (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: "100%", py: 0 }}>
                                      <Box sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "3px",
                                        backgroundColor: theme.palette.mode === 'light' ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}>
                                        <CalendarMonthIcon sx={{ fontSize: 10, color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary }} />
                                      </Box>
                                      <span style={{ color: theme.palette.mode === 'light' ? "#fff" : theme.palette.text.primary, fontSize: "0.85rem", fontWeight: 600, lineHeight: "1.2", display: "flex", alignItems: "center" }}>
                                        {SELECTOR_TABLE.MONTHLY}
                                      </span>
                                    </Box>
                                  );
                                default:
                                  return "";
                              }
                            }}
                          >
                            <MenuItem value="weekly">
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                                <Box sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}>
                                  <CalendarTodayIcon sx={{ fontSize: 16, color: "#fff" }} />
                                </Box>
                                {SELECTOR_TABLE.WEEKLY}
                              </Box>
                            </MenuItem>
                            <MenuItem value="biweekly">
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                                <Box sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}>
                                  <DateRangeIcon sx={{ fontSize: 16, color: "#fff" }} />
                                </Box>
                                {SELECTOR_TABLE.BIWEEKLY}
                              </Box>
                            </MenuItem>
                            <MenuItem value="monthly">
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                                <Box sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}>
                                  <CalendarMonthIcon sx={{ fontSize: 16, color: "#fff" }} />
                                </Box>
                                {SELECTOR_TABLE.MONTHLY}
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                    </TableCell>
                  )}
              </TableRow>
            </TableHead>
            <TableBody>
              {viewMode === "employee"
                ? paginatedEmployees.map((employee, rowIndex) => (
                    <TableRow
                      key={employee.id}
                      sx={{
                        ...tableRowBackground(rowIndex),
                      }}
                    >
                      <TableCell
                        sx={{
                          padding: isSmallScreen ? "3px 6px" : "4px 8px",
                          whiteSpace: "nowrap",
                          ...tableCellBackground(rowIndex, false),
                          position: "sticky",
                          left: 0,
                          zIndex: 10,
                        }}
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
                            sx={{ minWidth: 48, textAlign: "right" }}
                          >
                            {employee.firstName} {employee.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      {viewMode === "employee" && permissions?.includes(
                        PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                      ) && (
                        <TableCell
                          align="center"
                          sx={{
                            padding: isSmallScreen ? "3px 6px" : "4px 8px",
                            ...tableCellBackground(rowIndex, false),
                          }}
                        >
                          <PremiumTooltip title="Ver información">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  setOpenInfoDialogEmployee(employee)
                                }
                              >
                                <InfoOutlinedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </PremiumTooltip>
                        </TableCell>
                      )}
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
                            align="center"
                            sx={tableCellBackground(rowIndex, isToday(date))}
                          >
                            <EmployeeCellDropdown
                              value={scheduleData.finalSelectedLabel}
                              options={scheduleData.options}
                              disabled={!permissions?.includes(PERMISSIONS.EDIT_EMPLOYEE_ROLES)}
                              onChange={(event) => handleChange(event, employee.id, new Date(date))}
                              theme={theme}
                              styles={{}}
                            />
                          </TableCell>
                        );
                      })}
                      {viewMode === "employee" && permissions?.includes(
                        PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                      ) && (
                        <>
                          <TableCell
                            align="center"
                            sx={{
                              padding: isSmallScreen ? "3px 6px" : "4px 8px",
                              ...tableCellBackground(rowIndex, false),
                              color: theme.palette.text.primary,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="center"
                              alignItems="center"
                            >
                              {(() => {
                                const hasWorked = hasWorkedCurrentWeekForEmployee(employee);
                                return (
                                  <PremiumTooltip title="Ajustar horas">
                                    <span>
                                      <IconButton
                                        size="small"
                                        color={hasWorked ? "warning" : "default"}
                                        disabled={!hasWorked}
                                        onClick={() =>
                                          setOpenAdjustDialogEmployee(employee)
                                        }
                                      >
                                        <MoreTimeIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </PremiumTooltip>
                                );
                              })()}
                            </Stack>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              padding: isSmallScreen ? "3px 6px" : "4px 8px",
                              position: isSmallScreen ? "static" : "sticky",
                              right: 0,
                              zIndex: 2,
                              ...tableCellBackground(rowIndex, false),
                              color: theme.palette.text.primary,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  color: "text.primary",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {resultTotalHours(employee)} {SELECTOR_TABLE.HOURS}
                              </Typography>
                              <PremiumTooltip
                                title={Number(resultOvertime(employee)) > 0 ? `${resultOvertime(employee)} horas extra` : "Horas extra"}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minWidth: 24,
                                    height: 24,
                                    px: 0.5,
                                    borderRadius: "12px",
                                    backgroundColor: Number(resultOvertime(employee)) > 0 ? "success.main" : "grey.300",
                                    color: Number(resultOvertime(employee)) > 0 ? "#fff" : "grey.600",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    boxShadow: Number(resultOvertime(employee)) > 0 ? "0 2px 6px rgba(76, 175, 80, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  +{resultOvertime(employee)}
                                </Box>
                              </PremiumTooltip>
                            </Stack>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                : groupedSchedules.map((group, rowIndex) => (
                    <TableRow
                      key={group.label}
                      sx={{
                        ...tableRowBackground(rowIndex),
                        borderBottom: theme.palette.mode === "dark" ? "1px solid #444" : "none",
                      }}
                    >
                      <TableCell
                        sx={{
                          padding: isSmallScreen ? "3px 6px" : "4px 8px",
                          whiteSpace: "nowrap",
                          ...tableCellBackground(rowIndex, false),
                          position: "sticky",
                          left: 0,
                          zIndex: 10,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ minWidth: 48, textAlign: "right" }}
                          component="span"
                        >
                          {group.label}
                        </Typography>
                      </TableCell>

                      {currentWeek.map(({ day, date }) => {
                        const scheduleForDay =
                          group.dayToSchedule[day.toLowerCase()];
                        const isAvailable = !!scheduleForDay;
                        const assignedEmployees = isAvailable
                          ? getEmployeesForScheduleAndDay(
                              scheduleForDay.id,
                              date,
                              filteredEmployees,
                              hoursWorked
                            )
                          : [];
                        return (
                          <TableCell
                            key={day}
                            align="center"
                            sx={tableCellBackground(rowIndex, isToday(date))}
                          >
                            {isAvailable ? (
                              <ScheduleCellDropdown
                                assignedEmployees={assignedEmployees}
                                filteredEmployees={filteredEmployees}
                                canEdit={permissions?.includes(PERMISSIONS.EDIT_EMPLOYEE_ROLES)}
                                employeeSearchTerms={employeeSearchTerms}
                                onScheduleEmployeesChange={handleScheduleEmployeesChange}
                                onSearchChange={handleSearchChange}
                                scheduleForDay={scheduleForDay}
                                date={date}
                                theme={theme}
                                styles={{}}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.palette.text.disabled,
                                  fontSize: "0.85rem",
                                  fontWeight: 400,
                                  textAlign: "center",
                                }}
                              >
                                {SELECTOR_TABLE.NO_AVAILABLE}
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}

                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            minHeight: isSmallScreen ? "32px" : "36px",
            px: { xs: 1, sm: 1.5 },
            py: 0,
            flexShrink: 0,
            borderTop: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}
        >
          {!isSmallScreen && (
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.75rem", letterSpacing: "0.01em" }}>
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
                <Typography variant="caption" component="span" sx={{ fontSize: "0.75rem" }}>
                  {TABLE.ROWS_PER_PAGE}
                </Typography>
              }
              labelDisplayedRows={() => ""}
              ActionsComponent={PaginationComponent}
              sx={{
                flexShrink: 0,
                borderRadius: 0,
                margin: 0,
                border: 'none',
                '.MuiTablePagination-toolbar': {
                  minHeight: '32px',
                  paddingTop: '2px',
                  paddingBottom: '0px',
                  border: 'none',
                },
                '.MuiTablePagination-selectLabel, .MuiTablePagination-input, .MuiTablePagination-displayedRows': {
                  fontSize: '0.75rem',
                },
                '.MuiTablePagination-select': {
                  fontSize: '0.75rem',
                  border: 'none',
                },
                '.MuiTablePagination-selectIcon': {
                  fontSize: '1rem',
                },
                '.MuiIconButton-root': {
                  padding: '2px',
                },
                '.MuiInputBase-root': {
                  border: 'none',
                  '&:before, &:after': {
                    display: 'none',
                  },
                  fontSize: '0.75rem',
                },
                '.MuiTablePagination-input': {
                  fontSize: '0.75rem',
                },
              }}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: { horizontal: 'left', vertical: 'top' },
                  transformOrigin: { horizontal: 'left', vertical: 'bottom' },
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.75rem',
                        padding: '6px 12px',
                        border: 'none',
                        '&.Mui-selected': {
                          backgroundColor: 'transparent',
                          border: 'none',
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          border: 'none',
                        },
                      },
                    },
                  },
                },
                onBlur: (e) => {
                  e.target.blur();
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
        paperSx={adjustDialogPaperSx as object}
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
        paperSx={summaryDialogPaperSx as object}
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
          getEmployeeWeeklyOvertime={getEmployeeWeeklyOvertime}
          getEmployeeBiweeklyOvertime={getEmployeeBiweeklyOvertime}
          getEmployeeMonthlyOvertime={getEmployeeMonthlyOvertime}
          currentWeekNumber={weekNumber}
          currentBiweekNumber={biweekNumber}
          currentMonth={month}
          currentYear={year}
          theme={theme}
        />
      </DialogComponent>
      <DialogComponent
        open={openAddScheduleModal}
        onClose={() => setOpenAddScheduleModal(false)}
        title={MANAGEMENT.DIALOG_ADD_TITLE}
        subtitle={MANAGEMENT.SCHEDULES_PAGE.DIALOG_ADD_SUBTITLE}
        hideActions
        paperSx={{}}
        icon={<PlusCircle color="var(--mui-palette-info-main)" />}
      >
        <AddScheduleForm
          onSubmit={handleCreateSchedule}
          onCancel={() => setOpenAddScheduleModal(false)}
          isLoading={isCreatingSchedule}
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

export default memo(SelectorTableComponent);
