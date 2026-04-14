import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import { fetchEmployees } from "../../../store/slices/employeeSlice";
import { fetchSchedules } from "../../../store/slices/schedulesSlice";
import {
  fetchHoursWorked,
  createOrUpdateHoursWorked,
} from "../../../store/slices/hoursWorkedSlice";
import { useWeeklySummaries } from "../../../hooks/useWeeklySummary";
import { useBiweeklySummaries } from "../../../hooks/useBiweeklySummary";
import { useMonthlySummaries } from "../../../hooks/useMonthlySummary";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import SelectorTableComponent from "../../../components/Table/SelectorTable/SelectorTable.component";
import SpeedDialComponent from "../../../components/SpeedDial/SpeedDial.component";
import { es } from "date-fns/locale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  addWeeks,
  addDays,
  differenceInCalendarWeeks,
  endOfWeek,
  startOfWeek,
  format,
} from "date-fns";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress,
  SelectChangeEvent,
  Backdrop,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";
import { exportFileFormattedDate, exportTable } from "../../../utils/export";
import {
  getBiweekNumber,
  getBiweeklyDates,
  getCurrentWeekDates,
  getDayName,
  getFirstDayOfWeek,
  getMonthNumber,
  getWeekNumber,
  isValidDateForSelect,
  DayEntry,
} from "../../../utils/dates";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { Download, ChevronLeft, ChevronRight, X, Search, RotateCcw } from "lucide-react";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { ClipboardList, Sparkles } from "lucide-react";
import AutoGenerateModal, { AutoGenerateConfig } from "../../../components/Modal/AutoGenerateModal/AutoGenerateModal.component";
import {
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  searchBarSx,
  noEmployeesBoxStyles,
  noEmployeesIconStyles,
} from "./styles";
import { useLocation, useNavigate } from "react-router-dom";
import PremiumTooltip from "../../../components/PremiumTooltip/PremiumTooltip.component";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import {
  getPreferencesObject,
  setPreferencesObject,
} from "../../../utils/persistentState";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import NOTIFICATIONS from "../../../constants/notifications.constants";
import { createHoursGenerationNotification } from "../../../services/notificationService";
import { FileText, Table } from "lucide-react";
import { capitalizeFirstLetter } from "../../../utils/string";
import { getScheduleCellData } from "../../../components/Table/SelectorTable/helpers";
import {
  calculateTotalHours,
  calculateOvertime,
} from "../../../components/Table/SelectorTable/helpers/hoursCalculation";

const preferencesKey = "roles-preferences";
const defaultPreferences = { date: new Date().toISOString() };

// Roles management and summary page component
const RolesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();
  const { employees, isLoadingEmployees } = useSelector(
    (state: RootState) => state.employees
  );
  const { schedules, isLoadingSchedules } = useSelector(
    (state: RootState) => state.schedules
  );
  const { hoursWorked, isLoadingHoursWorked } = useSelector(
    (state: RootState) => state.hoursWorked
  );
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const {
    weeklySummaries,
    isLoadingWeeklySummaries,
    updateWeeklySummary,
    createOrUpdateWeeklySummary,
  } = useWeeklySummaries();
  const {
    biweeklySummaries,
    isLoadingBiweeklySummaries,
    createOrUpdateBiweeklySummary,
    updateBiweeklySummary,
  } = useBiweeklySummaries();
  const {
    monthlySummaries,
    isLoadingMonthlySummaries,
    createOrUpdateMonthlySummary,
    updateMonthlySummary,
  } = useMonthlySummaries();
  const [weekOffset, setWeekOffset] = useState(0);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<Date | null>(() => {
    const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
    return prefs.date ? new Date(prefs.date) : new Date();
  });
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number>(0);
  const [currentBiweekNumber, setCurrentBiweekNumber] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");
  const [isExporting, setIsExporting] = useState(false);
  const [openAddRoleModal, setOpenAddRoleModal] = useState(false);
  const [isGeneratingHours, setIsGeneratingHours] = useState(false);
  const [currentModalConfig, setCurrentModalConfig] = useState<AutoGenerateConfig | null>(null);
  const [viewMode, setViewMode] = useState<'employee' | 'schedule'>(() => {
    const savedViewMode = localStorage.getItem('selectorTableViewMode');
    const hasRolesPermission = userPermissions.includes(PERMISSIONS.VIEW_ROLES);
    const hasSchedulePermission = userPermissions.includes(PERMISSIONS.VIEW_SCHEDULES);
    
    // Si tiene permiso para roles, mostrar vista de horarios por defecto
    if (hasRolesPermission) {
      return (savedViewMode === 'employee' || savedViewMode === 'schedule')
        ? savedViewMode as 'employee' | 'schedule'
        : 'schedule';
    }
    
    // Si no tiene permiso para roles pero sí para horarios, mostrar horarios
    if (hasSchedulePermission) {
      return 'schedule';
    }
    
    // Si no tiene ninguno de los dos permisos, usar el guardado o default a empleados
    return (savedViewMode === 'employee' || savedViewMode === 'schedule') 
      ? savedViewMode as 'employee' | 'schedule' 
      : 'employee';
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialRowsPerPage = () => {
    if (typeof window !== "undefined") {
      // Total chrome: appbar(64) + page header(110) + selector header(36) + table head(36) + footer(36) + borders/gaps(20)
      const totalChrome = 302;
      const availableHeight = window.innerHeight - totalChrome;
      const rowHeight = 42;
      let rows = Math.floor(availableHeight / rowHeight);
      return Math.max(3, Math.min(100, rows));
    }
    return 25;
  };

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("roles-selector", getInitialRowsPerPage);

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectorTableViewMode', viewMode);
  }, [viewMode]);

  // Handle view mode based on permissions
  useEffect(() => {
    const hasRolesPermission = userPermissions.includes(PERMISSIONS.VIEW_ROLES);
    const hasSchedulePermission = userPermissions.includes(PERMISSIONS.VIEW_SCHEDULES);
    
    // Si no tiene permisos para roles pero sí para horarios, y está en vista de empleados, cambiar a horarios
    if (!hasRolesPermission && hasSchedulePermission && viewMode === 'employee') {
      setViewMode('schedule');
    }
  }, [userPermissions, viewMode]);

  // Fetch employees, schedules, and hours worked on mount
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchSchedules());
    dispatch(fetchHoursWorked());
  }, [dispatch, location.pathname]);

  // Initialize filteredSchedules with all schedules
  useEffect(() => {
    setFilteredSchedules(schedules);
  }, [schedules]);

  const isLoading =
    isLoadingEmployees ||
    isLoadingSchedules ||
    isLoadingHoursWorked ||
    isLoadingWeeklySummaries ||
    isLoadingBiweeklySummaries ||
    isLoadingMonthlySummaries;

  // Filter employees or schedules by search input based on viewMode
  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredEmployees(
      employees.filter((employee) =>
        normalizeString(`${employee.firstName} ${employee.lastName}`)
          .toLowerCase()
          .includes(normalizeString(search).toLowerCase())
      )
    );

    if (viewMode === 'employee') {
      // filteredEmployees ya está actualizado arriba
    } else {
      setFilteredSchedules(
        schedules.filter((schedule) =>
          normalizeString(schedule.label)
            .toLowerCase()
            .includes(normalizeString(search).toLowerCase())
        )
      );
    }
  }, [search, employees, schedules, viewMode]);



  // Update week, biweek, month, and year based on week offset
  useEffect(() => {
    const currentWeek = getCurrentWeekDates(weekOffset);

    if (currentWeek.length > 0) {
      const firstDayOfWeek = new Date(currentWeek[0].date);

      setCurrentWeekNumber((prev) => {
        const newWeekNumber = getWeekNumber(firstDayOfWeek);
        return newWeekNumber !== prev ? newWeekNumber : prev;
      });
      setCurrentBiweekNumber((prev) => {
        const newBiweekNumber = getBiweekNumber(firstDayOfWeek);
        return newBiweekNumber !== prev ? newBiweekNumber : prev;
      });
      setCurrentMonth((prev) => {
        const newMonth = getMonthNumber(firstDayOfWeek);
        return newMonth !== prev ? newMonth : prev;
      });
      setCurrentYear((prev) => {
        const newYear = new Date().getFullYear();
        return newYear !== prev ? newYear : prev;
      });
    }
  }, [weekOffset]);

  // Handle date picker change and update week offset
  const handleDateChange = useCallback((newDate: Date | null) => {
    if (newDate) {
      setFirstDayOfWeek(newDate);
      const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
      setPreferencesObject(preferencesKey, {
        ...prefs,
        date: newDate.toISOString(),
      });
      const today = new Date();
      const weekOptions: { weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {
        weekStartsOn: 1,
      };
      const newWeekOffset = differenceInCalendarWeeks(
        newDate,
        today,
        weekOptions
      );
      setWeekOffset(newWeekOffset);
    }
  }, []);

  // Helper function to recalculate and update weekly summary for an employee
  const recalculateEmployeeWeeklySummary = useCallback(async (
    employeeId: number,
    date: Date,
    newHoursWorkedEntry?: {
      employeeId: number;
      date: string;
      scheduleId: number;
    }
  ) => {
    const calculateTotalHoursForRange = (
      rangeStart: Date,
      rangeEnd: Date,
    ) => {
      const employeeHoursWorked = hoursWorked.filter((hw) => {
        const hwDate = new Date(hw.date);
        return (
          hw.employeeId === employeeId &&
          hwDate >= rangeStart &&
          hwDate <= rangeEnd
        );
      });

      const allEntries = newHoursWorkedEntry
        ? [
            ...employeeHoursWorked.filter((hw) => {
              const hwDate = new Date(hw.date);
              const newEntryDate = new Date(newHoursWorkedEntry.date);
              return hwDate.toDateString() !== newEntryDate.toDateString();
            }),
            newHoursWorkedEntry,
          ]
        : employeeHoursWorked;

      let totalHours = 0;

      allEntries.forEach((hw) => {
        const schedule = schedules.find((s) => s.id === hw.scheduleId);
        if (schedule) {
          let dayHours: number;
          if ("hours" in hw && typeof hw.hours === "number") {
            dayHours = hw.hours;
          } else {
            dayHours = schedule.hours;
          }
          totalHours += dayHours;
        }
      });

      return totalHours;
    };

    // Calculate total weekly hours for this employee
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    
    const totalWeeklyHours = calculateTotalHoursForRange(weekStart, weekEnd);

    // Update weekly summary
    const weekNumber = getWeekNumber(date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const existingWeeklySummary = weeklySummaries.find(
      (ws) => ws.employeeId === employeeId &&
               ws.weekNumber === weekNumber &&
               ws.year === year
    );

    const weeklySummary = {
      employeeId,
      weekNumber,
      month,
      year,
      totalHours: totalWeeklyHours,
    };

    if (existingWeeklySummary) {
      await updateWeeklySummary(existingWeeklySummary.id, weeklySummary);
    } else {
      await createOrUpdateWeeklySummary(weeklySummary);
    }

    const biweekNumber = getBiweekNumber(date);
    const { startDate: biweekStart, endDate: biweekEnd } = getBiweeklyDates(
      year,
      biweekNumber,
    );
    const totalBiweeklyHours = calculateTotalHoursForRange(
      biweekStart,
      biweekEnd,
    );
    const existingBiweeklySummary = biweeklySummaries.find(
      (bs) =>
        bs.employeeId === employeeId &&
        bs.biweekNumber === biweekNumber &&
        bs.year === year,
    );

    const biweeklySummary = {
      employeeId,
      biweekNumber,
      month,
      year,
      totalHours: totalBiweeklyHours,
    };

    if (existingBiweeklySummary) {
      await updateBiweeklySummary(existingBiweeklySummary.id, biweeklySummary);
    } else {
      await createOrUpdateBiweeklySummary(biweeklySummary);
    }

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const totalMonthlyHours = calculateTotalHoursForRange(
      monthStart,
      monthEnd,
    );
    const existingMonthlySummary = monthlySummaries.find(
      (ms) =>
        ms.employeeId === employeeId && ms.month === month && ms.year === year,
    );

    const monthlySummary = {
      employeeId,
      month,
      year,
      totalHours: totalMonthlyHours,
    };

    if (existingMonthlySummary) {
      await updateMonthlySummary(existingMonthlySummary.id, monthlySummary);
    } else {
      await createOrUpdateMonthlySummary(monthlySummary);
    }
  }, [
    hoursWorked,
    schedules,
    weeklySummaries,
    biweeklySummaries,
    monthlySummaries,
    updateWeeklySummary,
    createOrUpdateWeeklySummary,
    updateBiweeklySummary,
    createOrUpdateBiweeklySummary,
    updateMonthlySummary,
    createOrUpdateMonthlySummary,
  ]);

  useEffect(() => {
    const backfillCurrentPeriodSummaries = async () => {
      if (
        employees.length === 0 ||
        schedules.length === 0 ||
        hoursWorked.length === 0 ||
        !currentBiweekNumber ||
        !currentMonth ||
        !currentYear
      ) {
        return;
      }

      const calculateTotalHoursForRange = (
        employeeId: number,
        rangeStart: Date,
        rangeEnd: Date,
      ) => {
        const employeeHoursWorked = hoursWorked.filter((hw) => {
          const hwDate = new Date(hw.date);
          return (
            hw.employeeId === employeeId &&
            hwDate >= rangeStart &&
            hwDate <= rangeEnd
          );
        });

        let totalHours = 0;
        employeeHoursWorked.forEach((hw) => {
          const schedule = schedules.find((s) => s.id === hw.scheduleId);
          if (schedule) {
            let dayHours: number;
            if ("hours" in hw && typeof hw.hours === "number") {
              dayHours = hw.hours;
            } else {
              dayHours = schedule.hours;
            }
            totalHours += dayHours;
          }
        });

        return totalHours;
      };

      const { startDate: biweekStart, endDate: biweekEnd } = getBiweeklyDates(
        currentYear,
        currentBiweekNumber,
      );
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0);

      const biweeklyPromises = employees
        .filter(
          (employee) =>
            !biweeklySummaries.some(
              (bs) =>
                bs.employeeId === employee.id &&
                bs.biweekNumber === currentBiweekNumber &&
                bs.year === currentYear,
            ),
        )
        .map((employee) => {
          const totalHours = calculateTotalHoursForRange(
            employee.id,
            biweekStart,
            biweekEnd,
          );
          if (totalHours <= 0) {
            return Promise.resolve();
          }
          return createOrUpdateBiweeklySummary({
            employeeId: employee.id,
            biweekNumber: currentBiweekNumber,
            month: currentMonth,
            year: currentYear,
            totalHours,
          });
        });

      const monthlyPromises = employees
        .filter(
          (employee) =>
            !monthlySummaries.some(
              (ms) =>
                ms.employeeId === employee.id &&
                ms.month === currentMonth &&
                ms.year === currentYear,
            ),
        )
        .map((employee) => {
          const totalHours = calculateTotalHoursForRange(
            employee.id,
            monthStart,
            monthEnd,
          );
          if (totalHours <= 0) {
            return Promise.resolve();
          }
          return createOrUpdateMonthlySummary({
            employeeId: employee.id,
            month: currentMonth,
            year: currentYear,
            totalHours,
          });
        });

      await Promise.all([...biweeklyPromises, ...monthlyPromises]);
    };

    void backfillCurrentPeriodSummaries();
  }, [
    employees,
    schedules,
    hoursWorked,
    currentBiweekNumber,
    currentMonth,
    currentYear,
    biweeklySummaries,
    monthlySummaries,
    createOrUpdateBiweeklySummary,
    createOrUpdateMonthlySummary,
  ]);

  const handleChange = (
    event: SelectChangeEvent<string>,
    employeeId: number,
    date: Date
  ) => {
    if (event.target.value === "Other") {
      return;
    }

    const selectedSchedule = schedules.find(
      (schedule) =>
        schedule.label === event.target.value &&
        schedule.days.includes(getDayName(date))
    );

    if (!selectedSchedule) {
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");
    const existingHoursWorkedRecord = hoursWorked.find(
      (record) =>
        record.employeeId === employeeId &&
        format(new Date(record.date), "yyyy-MM-dd") === formattedDate
    );

    // Create/update HoursWorked entry
    const hoursWorkedEntry = {
      ...(existingHoursWorkedRecord ? { id: existingHoursWorkedRecord.id } : {}),
      employeeId,
      date: date.toISOString(),
      scheduleId: selectedSchedule.id,
    };

    // Update HoursWorked and recalculate summaries
    dispatch(createOrUpdateHoursWorked(hoursWorkedEntry)).then(() => {
      recalculateEmployeeWeeklySummary(employeeId, date, hoursWorkedEntry);
    });
  };

  const handleAdjustTime = async (
    employeeId: number,
    condition: "add" | "subtract",
    timeAdjustment: number
  ) => {
    if (!timeAdjustment || timeAdjustment < 0) return;

    const adjustment = condition === "add" ? timeAdjustment : -timeAdjustment;

    const existingWeeklySummary = weeklySummaries.find(
      (weeklySummary) =>
        weeklySummary.employeeId === employeeId &&
        weeklySummary.weekNumber === currentWeekNumber &&
        weeklySummary.month === currentMonth &&
        weeklySummary.year === currentYear
    );
    const existingBiweeklySummary = biweeklySummaries.find(
      (biweeklySummary) =>
        biweeklySummary.employeeId === employeeId &&
        biweeklySummary.biweekNumber === currentBiweekNumber &&
        biweeklySummary.month === currentMonth &&
        biweeklySummary.year === currentYear
    );
    const existingMonthlySummary = monthlySummaries.find(
      (monthlySummary) =>
        monthlySummary.employeeId === employeeId &&
        monthlySummary.month === currentMonth &&
        monthlySummary.year === currentYear
    );

    const updatedWeeklyTotal = Math.max(
      0,
      (existingWeeklySummary?.totalHours ?? 0) + adjustment
    );
    const updatedBiweeklyTotal = Math.max(
      0,
      (existingBiweeklySummary?.totalHours ?? 0) + adjustment
    );
    const updatedMonthlyTotal = Math.max(
      0,
      (existingMonthlySummary?.totalHours ?? 0) + adjustment
    );

    await Promise.all([
      existingWeeklySummary
        ? updateWeeklySummary(existingWeeklySummary.id, {
            ...existingWeeklySummary,
            totalHours: updatedWeeklyTotal,
          })
        : createOrUpdateWeeklySummary({
            employeeId,
            weekNumber: currentWeekNumber,
            month: currentMonth,
            year: currentYear,
            totalHours: updatedWeeklyTotal,
          }),
      existingBiweeklySummary
        ? updateBiweeklySummary(existingBiweeklySummary.id, {
            ...existingBiweeklySummary,
            totalHours: updatedBiweeklyTotal,
          })
        : createOrUpdateBiweeklySummary({
            employeeId,
            biweekNumber: currentBiweekNumber,
            month: currentMonth,
            year: currentYear,
            totalHours: updatedBiweeklyTotal,
          }),
      existingMonthlySummary
        ? updateMonthlySummary(existingMonthlySummary.id, {
            ...existingMonthlySummary,
            totalHours: updatedMonthlyTotal,
          })
        : createOrUpdateMonthlySummary({
            employeeId,
            month: currentMonth,
            year: currentYear,
            totalHours: updatedMonthlyTotal,
          }),
    ]);
  };

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1);
    setFirstDayOfWeek(getFirstDayOfWeek(weekOffset + 1));
  };

  const handlePreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
    setFirstDayOfWeek(getFirstDayOfWeek(weekOffset - 1));
  };

  const handleCurrentWeek = () => {
    setWeekOffset(0);
    setFirstDayOfWeek(new Date());
  };

  const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

  const handleOpenExportDialog = (type: "excel" | "pdf") => {
    setExportType(type);
    setOpenExportDialog(true);
  };

  const handleCloseAddRoleModal = () => {
    setOpenAddRoleModal(false);
  };

  const handleGenerateHours = async (config: AutoGenerateConfig) => {
    try {
      // Validate configuration
      if (config.selectedEmployees.length === 0) {
        throw new Error('No hay empleados seleccionados');
      }
      
      // Get available schedules for balanced distribution
      const availableSchedules = schedules.length > 0 ? schedules : [];
      if (availableSchedules.length === 0) {
        throw new Error('No hay horarios disponibles para asignar');
      }
      
      // Get non-special schedules and special "Libre" schedule
      const nonSpecialSchedules = availableSchedules.filter(schedule => !schedule.specialSchedule);
      const libreSchedule = availableSchedules.find(schedule => 
        schedule.specialSchedule && schedule.label.toLowerCase().includes('libre')
      );
      
      if (nonSpecialSchedules.length === 0) {
        throw new Error('No hay horarios regulares disponibles para asignar');
      }
      
      // Calculate weekly hours for each schedule to plan distribution
      const scheduleWeeklyHours: Record<string, number> = {};
      const scheduleLabels = [...new Set(nonSpecialSchedules.map(s => s.label))];
      
      // Calculate total weekly hours for each schedule label
      scheduleLabels.forEach(label => {
        let totalHours = 0;
        const weekStart = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
        
        for (let i = 0; i < 7; i++) {
          const dayDate = addDays(weekStart, i);
          const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
          
          const daySchedule = nonSpecialSchedules.find(s => 
            s.label === label && s.days && s.days.includes(dayName)
          );
          
          if (daySchedule) {
            totalHours += daySchedule.hours;
          }
        }
        
        scheduleWeeklyHours[label] = totalHours;
      });
      
      // All non-special schedules should be covered, regardless of their weekly hours
      // The maxHoursPerWeek limit will be applied to individual employees, not to schedules
      const validScheduleLabels = Object.keys(scheduleWeeklyHours);
      
      // Sort valid schedules by weekly hours (ascending) to prioritize shorter schedules
      const sortedScheduleLabels = validScheduleLabels.sort((a, b) => 
        scheduleWeeklyHours[a] - scheduleWeeklyHours[b]
      );
      
      // Track schedule assignments to enforce max 3-4 employees per schedule
      const scheduleAssignments: Record<string, number> = {};
      const maxEmployeesPerSchedule = 4;
      
      // Initialize assignments for each schedule
      sortedScheduleLabels.forEach(label => {
        scheduleAssignments[label] = 0;
      });
      
      // Distribute employees across schedules to balance hours
      const employeeAssignments: Record<number, string> = {};
      
      // Separate employees with custom schedules
      const employeesWithCustomSchedules = config.selectedEmployees.filter(employeeId => 
        config.customSchedules[employeeId]
      );
      const employeesToDistribute = config.selectedEmployees.filter(employeeId => 
        !config.customSchedules[employeeId]
      );
      
      // First, assign employees with custom schedules
      for (const employeeId of employeesWithCustomSchedules) {
        const customSchedule = availableSchedules.find(s => s.id === config.customSchedules[employeeId]);
        if (customSchedule) {
          employeeAssignments[employeeId] = customSchedule.label;
          scheduleAssignments[customSchedule.label] = (scheduleAssignments[customSchedule.label] || 0) + 1;
        }
      }
      
      // Calculate how many employees we need to assign to each schedule
      const totalEmployeesToDistribute = employeesToDistribute.length;
      const totalSchedules = sortedScheduleLabels.length;
      
      if (totalSchedules > 0) {
        // Calculate base distribution (minimum employees per schedule)
        const baseEmployeesPerSchedule = Math.floor(totalEmployeesToDistribute / totalSchedules);
        const remainingEmployees = totalEmployeesToDistribute % totalSchedules;
        
         // Distribute base employees to each schedule
         for (let i = 0; i < sortedScheduleLabels.length; i++) {
           const label = sortedScheduleLabels[i];
           const baseCount = baseEmployeesPerSchedule + (i < remainingEmployees ? 1 : 0);
           scheduleAssignments[label] = baseCount;
         }
         
         // Now assign employees to schedules based on the calculated distribution
         let employeeIndex = 0;
         for (const label of sortedScheduleLabels) {
           const targetCount = scheduleAssignments[label];
           
           // Assign employees to this schedule
           for (let i = 0; i < targetCount && employeeIndex < employeesToDistribute.length; i++) {
             const employeeId = employeesToDistribute[employeeIndex];
             employeeAssignments[employeeId] = label;
             employeeIndex++;
           }
         }
        
        // If there are still employees to assign, distribute them evenly
        while (employeeIndex < employeesToDistribute.length) {
          // Find the schedule with the least employees
          let minSchedule = sortedScheduleLabels[0];
          let minCount = scheduleAssignments[minSchedule] || 0;
          
          for (const label of sortedScheduleLabels) {
            const currentCount = scheduleAssignments[label] || 0;
            if (currentCount < minCount && currentCount < maxEmployeesPerSchedule) {
              minSchedule = label;
              minCount = currentCount;
            }
          }
          
          // If all schedules are at max capacity, assign to "Libre"
          if (minCount >= maxEmployeesPerSchedule) {
            if (libreSchedule) {
              const employeeId = employeesToDistribute[employeeIndex];
              employeeAssignments[employeeId] = libreSchedule.label;
            }
          } else {
            // Assign to the schedule with least employees
            const employeeId = employeesToDistribute[employeeIndex];
            employeeAssignments[employeeId] = minSchedule;
            scheduleAssignments[minSchedule] = (scheduleAssignments[minSchedule] || 0) + 1;
          }
          
          employeeIndex++;
        }
      }
      
      // Generate hours for each employee based on their assigned schedule
      const promises = config.selectedEmployees.map(async (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (!employee) {
          return;
        }

        const assignedScheduleLabel = employeeAssignments[employeeId];
        if (!assignedScheduleLabel) {
          // Employee could not be assigned to any schedule
          return;
        }

        // Process each day of the week - assign appropriate schedule for each day
        let current = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
        
        // Determine if we need to redistribute hours for individual/uniform mode
        const needsRedistribution = (config.mode === 'individual' && config.individualHours[employeeId] !== undefined) ||
                                   (config.mode === 'uniform' && config.uniformHours > 0);
        
        // Calculate total weekly hours for this employee
        let totalWeeklyHours = 0;
        const weekDays = [];
        
        // Check if target hours is 0 (for both individual and uniform modes)
        const targetWeeklyHours = config.mode === 'individual' 
          ? (config.individualHours[employeeId] !== undefined ? config.individualHours[employeeId] : 0)
          : config.uniformHours;
          
        // If target hours is 0, don't assign any hours
        if (targetWeeklyHours === 0) {
          totalWeeklyHours = 0;
          // Still create/update the weekly summary with 0 hours
          const weekStartDate = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
          const weeklySummary = {
            employeeId,
            weekNumber: getWeekNumber(weekStartDate),
            month: weekStartDate.getMonth() + 1,
            year: weekStartDate.getFullYear(),
            totalHours: 0,
          };
          await createOrUpdateWeeklySummary(weeklySummary);
          return;
        }
        
        // Find the minimum daily hours available in schedules
        const minDailyHours = Math.min(...availableSchedules
          .filter(s => s.label === assignedScheduleLabel && s.hours > 0)
          .map(s => s.hours)
        );
        
        // If target hours are less than the minimum daily hours, don't assign anything
        if (targetWeeklyHours < minDailyHours) {
          totalWeeklyHours = 0;
          // Still create/update the weekly summary with 0 hours
          const weekStartDate = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
          const weeklySummary = {
            employeeId,
            weekNumber: getWeekNumber(weekStartDate),
            month: weekStartDate.getMonth() + 1,
            year: weekStartDate.getFullYear(),
            totalHours: 0,
          };
          await createOrUpdateWeeklySummary(weeklySummary);
          return;
        }
        
        if (needsRedistribution) {
            
          // Apply maximum hours limit
          const maxHoursPerWeek = config.maxHoursPerWeek || 48;
          const limitedTargetHours = Math.min(targetWeeklyHours, maxHoursPerWeek);
            
          // Find the schedule's daily hours
          const scheduleDailyHours = availableSchedules.find(s => 
            s.label === assignedScheduleLabel && 
            s.days && s.days.includes('monday') // Use any day to get the hours
          )?.hours || 0;
          
          if (scheduleDailyHours > 0) {
            // Calculate how many days we need to assign
            const daysNeeded = Math.ceil(limitedTargetHours / scheduleDailyHours);
            
            // Create entries only for the required number of days
            const redistributedEntries = [];
            let accumulatedHours = 0;
            
            for (let i = 0; i < 7; i++) {
              const dayDate = addDays(current, i);
              const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
              
              // Find the schedule for this specific day and label
              const daySchedule = availableSchedules.find(s => 
                s.label === assignedScheduleLabel && 
                s.days && s.days.includes(dayName)
              );
              
              if (daySchedule && i < daysNeeded) {
                // Check if adding this day's hours would exceed the limit
                if (accumulatedHours + daySchedule.hours <= limitedTargetHours) {
                  // Assign the schedule for this day
                  const hoursWorkedEntry = {
                    employeeId,
                    date: dayDate.toISOString(),
                    scheduleId: daySchedule.id,
                  };
                  redistributedEntries.push(hoursWorkedEntry);
                  totalWeeklyHours += daySchedule.hours;
                  accumulatedHours += daySchedule.hours;
                } else {
                  // Stop assigning more days to respect the limit
                  break;
                }
              }
            }
            
            // Create redistributed entries
            await Promise.all(
              redistributedEntries.map(async (entry) => {
                await dispatch(createOrUpdateHoursWorked(entry));
              })
            );
          }
        } else {
          // Create original entries without redistribution
          for (let i = 0; i < 7; i++) {
            const dayDate = addDays(current, i);
            const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
            
            // Find the schedule for this specific day and label
            const daySchedule = availableSchedules.find(s => 
              s.label === assignedScheduleLabel && 
              s.days && s.days.includes(dayName)
            );
            
            // Create HoursWorked entry for this day
            if (daySchedule) {
              const hoursWorkedEntry = {
                employeeId,
                date: dayDate.toISOString(),
                scheduleId: daySchedule.id,
              };
              weekDays.push(hoursWorkedEntry);
              
              // Add to total weekly hours
              totalWeeklyHours += daySchedule.hours;
            }
          }
          
          // Create original entries
          await Promise.all(
            weekDays.map(async (entry) => {
              await dispatch(createOrUpdateHoursWorked(entry));
            })
          );
        }
        
        // Then create/update the weekly summary with the correct total
        if (totalWeeklyHours > 0) {
          const weekStartDate = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
          
          // Calculate final total hours based on mode and limits
          let finalTotalHours = totalWeeklyHours;
          
          if (config.mode === 'individual' && config.individualHours[employeeId]) {
            // Use the actual calculated hours (which respects the max limit)
            finalTotalHours = totalWeeklyHours;
          } else if (config.mode === 'uniform' && config.uniformHours) {
            // Use the actual calculated hours (which respects the max limit)
            finalTotalHours = totalWeeklyHours;
          } else {
            // For default mode, show the actual calculated hours
            finalTotalHours = totalWeeklyHours;
          }
          
          const weeklySummary = {
            employeeId,
            weekNumber: getWeekNumber(weekStartDate),
            month: weekStartDate.getMonth() + 1,
            year: weekStartDate.getFullYear(),
            totalHours: finalTotalHours,
          };
          await createOrUpdateWeeklySummary(weeklySummary);
        }
      });

      // Wait for all operations to complete
      await Promise.all(promises);

      // Refresh data
      await dispatch(fetchHoursWorked());
      
      showNotification(NOTIFICATIONS.HOURS_GENERATION_SUCCESS, {
        severity: "success",
        duration: 5000,
        closeable: true,
        buttonText: "Ver resultados",
        onButtonClick: () => {
          // Navigate to the current page (roles) to show the generated results
          navigate('/roles');
        }
      });
      
      // Add notification to menu
      createHoursGenerationNotification(true, config.selectedEmployees.length);
      
      setOpenAddRoleModal(false);
    } catch (error) {
      showNotification(NOTIFICATIONS.HOURS_GENERATION_ERROR, {
        severity: "error",
        duration: 5000,
      });
      
      // Add error notification to menu
      createHoursGenerationNotification(false);
    } finally {
      setIsGeneratingHours(false);
    }
  };

  const handleModalConfigChange = (config: AutoGenerateConfig) => {
    setCurrentModalConfig(config);
  };

  const handleGenerateFromDialog = () => {
    // Verificar permisos para generar horas
    if (!userPermissions.includes(PERMISSIONS.EDIT_EMPLOYEE_ROLES)) {
      showNotification("No tienes permisos para generar horas automáticamente", {
        severity: "error",
        duration: 3000,
      });
      return;
    }
    
    if (!currentModalConfig) {
      showNotification(NOTIFICATIONS.HOURS_GENERATION_NO_CONFIG, {
        severity: "error",
        duration: 3000,
      });
      return;
    }
    // Activate loading immediately for better UX
    setIsGeneratingHours(true);
    
    // Show processing notification
    showNotification(NOTIFICATIONS.HOURS_GENERATION_PROCESSING, {
      severity: "info",
      duration: 2000,
    });
    
    // Use setTimeout to ensure the loading state is rendered before starting the process
    setTimeout(() => {
      handleGenerateHours(currentModalConfig);
    }, 50);
  };

  // Helper: gets the assigned schedule label for an employee on a given day
  const getScheduleLabelForDay = (
    employee: Employee,
    day: string,
    date: Date
  ): string => {
    // Uses the same helper as the grid to get the label
    return getScheduleCellData(
      employee,
      day,
      date.toISOString(),
      schedules,
      hoursWorked
    ).finalSelectedLabel;
  };

  // Helper: builds dynamic headers for export
  const getExportHeaders = (
    currentWeek: DayEntry[],
    includeTotals: boolean
  ): string[] => {
    const dayHeaders = currentWeek.map(({ day, date }) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      // Ejemplo: "Lunes 08 de Julio de 2024"
      return capitalizeFirstLetter(
        format(dateObj, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })
      );
    });
    const baseHeaders = ["Empleado", ...dayHeaders];
    return includeTotals
      ? [...baseHeaders, "Total horas", "Horas extra"]
      : baseHeaders;
  };

  // Helper: builds dynamic export data
  const getExportData = (
    employees: Employee[],
    currentWeek: DayEntry[],
    includeTotals: boolean,
    dayHeaders: string[]
  ): Record<string, string | number>[] => {
    return employees.map((employee: Employee) => {
      const row: Record<string, string | number> = {
        Empleado: `${employee.firstName} ${employee.lastName}`,
      };
      currentWeek.forEach(({ day, date }, idx) => {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        // Usar el mismo formato que los headers
        const header = dayHeaders[idx];
        row[header] = getScheduleLabelForDay(employee, day, dateObj);
      });
      if (includeTotals) {
        row["Total horas"] = calculateTotalHours(
          employee,
          "weekly",
          currentWeek,
          currentWeekNumber,
          currentBiweekNumber,
          currentMonth,
          currentYear,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          {
            weekNumbers: [{ weekNumber: currentWeekNumber, year: currentYear }],
            biweekNumbers: [
              { biweekNumber: currentBiweekNumber, year: currentYear },
            ],
            months: [{ month: currentMonth, year: currentYear }],
          }
        );
        row["Horas extra"] = calculateOvertime(
          employee,
          "weekly",
          currentWeek,
          currentWeekNumber,
          currentBiweekNumber,
          currentMonth,
          currentYear,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          {
            weekNumbers: [{ weekNumber: currentWeekNumber, year: currentYear }],
            biweekNumbers: [
              { biweekNumber: currentBiweekNumber, year: currentYear },
            ],
            months: [{ month: currentMonth, year: currentYear }],
          }
        );
      }
      return row;
    });
  };

  // Helper: builds grouped headers for export (month/year row + day row)
  const getGroupedHeaders = (
    currentWeek: DayEntry[],
    includeTotals: boolean
  ) => {
    if (!currentWeek.length) return undefined;
    const dateObj =
      typeof currentWeek[0].date === "string"
        ? new Date(currentWeek[0].date)
        : currentWeek[0].date;
    const monthYear = capitalizeFirstLetter(
      format(dateObj, "MMMM yyyy", { locale: es })
    );
    const totalCols = 1 + currentWeek.length + (includeTotals ? 2 : 0);
    const firstRow = [monthYear, ...Array(totalCols - 1).fill("")];
       const secondRow = [
      "Empleado",
      ...currentWeek.map(({ day, date }) => {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return `${capitalizeFirstLetter(format(dateObj, "EEEE dd", { locale: es }))}`;
      }),
      ...(includeTotals ? ["Total horas", "Horas extra"] : []),
    ];
    return [firstRow, secondRow];
  };

  const currentWeek: DayEntry[] = getCurrentWeekDates(weekOffset);

  // Export handler
  const handleExportHours = async (shouldExportHours: boolean) => {
    setIsExporting(true);
    try {
      const headers = getExportHeaders(currentWeek, shouldExportHours);
      const data = getExportData(
        filteredEmployees,
        currentWeek,
        shouldExportHours,
        headers.slice(1, shouldExportHours ? -2 : undefined)
      );
      const groupedHeaders = getGroupedHeaders(currentWeek, shouldExportHours);
      const fileName = `Roles_${exportFileFormattedDate(new Date())}`;
      await exportTable({
        data,
        fileName,
        format: exportType,
        customHeaders: headers,
        groupedHeaders: exportType === "excel" ? groupedHeaders : undefined,
      });
    } catch (error) {
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = useMemo(() => {
    const options = [];
    if (userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES)) {
      options.push({
        label: "Exportar a Excel",
        icon: <Table size={20} />,
        onClick: () => handleOpenExportDialog("excel"),
      });
    }
    if (userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES)) {
      options.push({
        label: "Exportar a PDF",
        icon: <FileText size={20} />,
        onClick: () => handleOpenExportDialog("pdf"),
      });
    }
    return options;
  }, [userPermissions]);

  return (
    <Box sx={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
      {isLoading ? (
        <Box sx={loadingBoxStyles}>
          <Backdrop sx={backdropStyles(theme)} open={isLoading}>
            <CircularProgress />
          </Backdrop>
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Premium Header with light background */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2.5 },
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              flexShrink: 0,
              borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            {/* Title Row */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "10px",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ClipboardList size={22} color={theme.palette.primary.contrastText} />
                </Box>
                <Box>
                  <Typography
                    variant={isSmallScreen ? "h6" : "h5"}
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      color: theme.palette.text.primary,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    {isSmallScreen ? PAGE_TITLE.ROLES_SIMPLIFIED : PAGE_TITLE.ROLES}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "0.75rem",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {viewMode === 'employee' 
                      ? `${filteredEmployees.length} empleados` 
                      : `${filteredSchedules.length} horarios`}
                  </Typography>
                </Box>
              </Box>

              {/* Export Speed Dial */}
              {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES) &&
                userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES) && (
                  <Box sx={{ ...exportSpeedDialBoxStyles, minHeight: 'auto' }}>
                    {(viewMode === 'employee' ? filteredEmployees.length > 0 : filteredSchedules.length > 0) && (
                      <SpeedDialComponent
                        actions={exportOptions}
                        mainIcon={<Download size={20} />}
                        openIcon={<X size={20} />}
                        direction="left"
                      />
                    )}
                  </Box>
                )}
            </Box>

            {/* Controls Row */}
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              gap={1}
            >
              {/* Search */}
              <Box flex={1} maxWidth={{ sm: "380px" }}>
                {(viewMode === 'employee' ? filteredEmployees : filteredSchedules) && (
                  <SearchBarComponent
                    placeholder={
                      viewMode === 'employee'
                        ? MANAGEMENT.ROLES_PAGE.SEARCH_PLACEHOLDER
                        : MANAGEMENT.SCHEDULES_PAGE.SEARCH_PLACEHOLDER
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    sx={{
                      ...searchBarSx,
                      '& .MuiOutlinedInput-root': {
                        height: '44px',
                        borderRadius: '10px',
                      },
                    }}
                    fullWidth
                  />
                )}
              </Box>

              {/* Date Picker and Navigation */}
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                flexWrap="wrap"
                justifyContent={{ xs: "flex-start", sm: "flex-end" }}
              >
                {/* Previous Week Button */}
                <PremiumTooltip title={MANAGEMENT.TOOLTIP_PREV_WEEK}>
                  <Button
                    variant="outlined"
                    onClick={handlePreviousWeek}
                    disableRipple
                    disableElevation
                    sx={{
                      minWidth: '44px',
                      height: '44px',
                      px: 1.5,
                      borderRadius: '10px',
                      borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                      '&:hover': {
                        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                      },
                    }}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                </PremiumTooltip>

                {/* Date Picker */}
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    value={firstDayOfWeek}
                    maxDate={nextWeekEnd}
                    views={["year", "month", "day"]}
                    format="EEEE d 'de' MMMM 'de' yyyy"
                    slots={{ toolbar: () => null }}
                    slotProps={{
                      textField: {
                        fullWidth: false,
                        required: true,
                        variant: "outlined",
                        sx: {
                          width: { xs: '100%', sm: '280px' },
                          '& .MuiOutlinedInput-root': {
                            height: "44px",
                            borderRadius: '10px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& fieldset': {
                              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                              borderWidth: '1px',
                            },
                            '&:hover': {
                              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                              '& fieldset': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                              },
                            },
                            '&.Mui-focused': {
                              boxShadow: '0 0 0 3px rgba(0,0,0,0.04)',
                              '& fieldset': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: '2px',
                              },
                            },
                            '& input': {
                              textOverflow: 'ellipsis',
                              textAlign: 'center',
                            },
                          },
                        },
                      },
                    }}
                    closeOnSelect
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>

                {/* Next Week Button */}
                <PremiumTooltip title={MANAGEMENT.TOOLTIP_NEXT_WEEK}>
                  <span>
                    <Button
                      variant="outlined"
                      disabled={
                        !isValidDateForSelect(
                          new Date(
                            getCurrentWeekDates(weekOffset + 1)[0].isoDate
                          )
                        )
                      }
                      onClick={handleNextWeek}
                      disableRipple
                      disableElevation
                      sx={{
                        minWidth: '44px',
                        height: '44px',
                        px: 1.5,
                        borderRadius: '10px',
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                        '&:hover': {
                          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                        },
                        '&.Mui-disabled': {
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </span>
                </PremiumTooltip>

                {/* Current Week Button */}
                <PremiumTooltip title={MANAGEMENT.TOOLTIP_CURRENT_WEEK}>
                  <span>
                    <Button
                      variant="outlined"
                      disabled={weekOffset === 0}
                      onClick={handleCurrentWeek}
                      disableRipple
                      disableElevation
                      sx={{
                        minWidth: '44px',
                        height: '44px',
                        px: 1.5,
                        borderRadius: '10px',
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                        '&:hover': {
                          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                        },
                        '&.Mui-disabled': {
                          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <RotateCcw size={18} />
                    </Button>
                  </span>
                </PremiumTooltip>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: "hidden", p: 0 }}>
          {(() => {
            const hasRolesPermission = userPermissions.includes(PERMISSIONS.VIEW_ROLES);
            
            // Si no tiene permisos para ver roles, mostrar mensaje de error
            if (!hasRolesPermission) {
              return (
                <Box sx={noEmployeesBoxStyles}>
                  <Search size={48} style={{ color: theme.palette.text.disabled, ...noEmployeesIconStyles }} />
                  <Typography variant="h6" color="textSecondary">
                    No tienes permisos para ver roles
                  </Typography>
                </Box>
              );
            }
            
            return viewMode === 'employee' ? (
              isLoadingEmployees ? (
                <Box sx={loadingBoxStyles}>
                  <Backdrop sx={backdropStyles(theme)} open={isLoadingEmployees}>
                    <CircularProgress />
                  </Backdrop>
                </Box>
              ) : filteredEmployees.length > 0 ? (
                <SelectorTableComponent
                key={`schedules-${schedules.length}-${schedules.map((s) => s.id).join("-")}`}
                filteredEmployees={filteredEmployees}
                schedules={schedules}
                hoursWorked={hoursWorked}
                weeklySummaries={weeklySummaries}
                biweeklySummaries={biweeklySummaries}
                monthlySummaries={monthlySummaries}
                weekOffset={weekOffset}
                weekNumber={currentWeekNumber}
                biweekNumber={currentBiweekNumber}
                month={currentMonth}
                year={currentYear}
                handleChange={handleChange}
                handleAdjustTime={handleAdjustTime}
                recalculateEmployeeWeeklySummary={recalculateEmployeeWeeklySummary}
                permissions={userPermissions}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            ) : (
              <Box sx={noEmployeesBoxStyles}>
                <Search size={48} style={{ color: theme.palette.text.disabled, ...noEmployeesIconStyles }} />
                <Typography variant="h6" color="textSecondary">
                  {MANAGEMENT.NO_EMPLOYEES}
                </Typography>
              </Box>
            )
          ) : (
            isLoadingSchedules ? (
              <Box sx={loadingBoxStyles}>
                <Backdrop sx={backdropStyles(theme)} open={isLoadingSchedules}>
                  <CircularProgress />
                </Backdrop>
              </Box>
            ) : filteredSchedules.length > 0 ? (
              <SelectorTableComponent
                key={`schedules-${filteredSchedules.length}-${filteredSchedules.map((s) => s.id).join("-")}`}
                filteredEmployees={filteredEmployees}
                schedules={filteredSchedules}
                hoursWorked={hoursWorked}
                weeklySummaries={weeklySummaries}
                biweeklySummaries={biweeklySummaries}
                monthlySummaries={monthlySummaries}
                weekOffset={weekOffset}
                weekNumber={currentWeekNumber}
                biweekNumber={currentBiweekNumber}
                month={currentMonth}
                year={currentYear}
                handleChange={handleChange}
                handleAdjustTime={handleAdjustTime}
                recalculateEmployeeWeeklySummary={recalculateEmployeeWeeklySummary}
                permissions={userPermissions}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            ) : (
              <Box sx={noEmployeesBoxStyles}>
                <Search size={48} style={{ color: theme.palette.text.disabled, ...noEmployeesIconStyles }} />
                <Typography variant="h6" color="textSecondary">
                  {MANAGEMENT.NO_SCHEDULES}
                </Typography>
              </Box>
            )
          );
        })()}
          </Box>
          <DialogComponent
            open={openExportDialog}
            onClose={() => {
              setOpenExportDialog(false);
              handleExportHours(false);
            }}
            onConfirm={() => {
              setOpenExportDialog(false);
              handleExportHours(true);
            }}
            title={MANAGEMENT.DIALOG_EXPORT_TITLE}
            message={MANAGEMENT.DIALOG_EXPORT_MESSAGE}
            type="warning"
            confirmText={MANAGEMENT.DIALOG_EXPORT_CONFIRM}
            cancelText={MANAGEMENT.DIALOG_EXPORT_CANCEL}
            loading={isExporting}
            icon={<Download size={24} color="orange" />}
          />
        </Paper>
      )}
      
      <Dialog
        open={openAddRoleModal}
        onClose={handleCloseAddRoleModal}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            border: "2px solid #fff",
            borderRadius: 3,
            minHeight: "60vh",
            boxShadow: 3,
            bgcolor: "background.paper",
            width: { xs: '98%', sm: '1200px' },
            maxWidth: { xs: '98%', sm: '1200px' },
            height: { xs: '95vh', sm: 'auto' },
            maxHeight: { xs: '95vh', sm: '90vh' },
          },
        }}
      >
        {/* Header with theme styling */}
        <Box sx={{
          background: (theme) => theme.palette.mode === "dark" ? "#111" : theme.palette.primary.main,
          color: (theme) => theme.palette.mode === "dark" ? "#fff" : theme.palette.primary.contrastText,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 3,
          py: 2,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{
              background: (theme) => theme.palette.primary.contrastText,
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Sparkles size={24} style={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                color="inherit"
                sx={{ lineHeight: 1.2, mb: 0.5 }}
              >
                Autogeneración de Roles
              </Typography>
              <Typography
                variant="body2"
                color="inherit"
                sx={{ opacity: 0.9, lineHeight: 1.2 }}
              >
                Configurar parámetros
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleCloseAddRoleModal} 
            sx={{ color: "inherit", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <AutoGenerateModal
            onGenerate={handleGenerateHours}
            onCancel={handleCloseAddRoleModal}
            employees={employees}
            schedules={schedules}
            currentWeekStart={firstDayOfWeek || new Date()}
            isLoading={isGeneratingHours}
            onConfigChange={handleModalConfigChange}
          />
        </DialogContent>

        <DialogActions sx={{ gap: 2, px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseAddRoleModal}
            variant="outlined"
            sx={{ minWidth: 120, py: 1.5, fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateFromDialog}
            variant="contained"
            color="primary"
            disabled={isGeneratingHours || !userPermissions.includes(PERMISSIONS.EDIT_EMPLOYEE_ROLES)}
            sx={{ minWidth: 200, py: 1.5, fontWeight: 600 }}
          >
            {isGeneratingHours ? "Generando..." : "Generar Horas"}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
  );
};

export default RolesPage;
