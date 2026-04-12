/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";

import { useReduxData, useAppDispatch } from "../../../hooks/useReduxData";
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
import AppModal from "../../../components/AppModal/AppModal.component";
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
import { useNavigate } from "react-router-dom";
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
  const dispatch = useAppDispatch();
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();
  const employees = useReduxData((state) => state.employees.employees);
  const isLoadingEmployees = useReduxData((state) => state.employees.isLoadingEmployees);
  const schedules = useReduxData((state) => state.schedules.schedules);
  const isLoadingSchedules = useReduxData((state) => state.schedules.isLoadingSchedules);
  const hoursWorked = useReduxData((state) => state.hoursWorked.hoursWorked);
  const isLoadingHoursWorked = useReduxData((state) => state.hoursWorked.isLoadingHoursWorked);
  const {
    weeklySummaries,
    totalCountWeeklySummaries,
    isLoadingWeeklySummaries,
    updateWeeklySummary,
    createOrUpdateWeeklySummary,
  } = useWeeklySummaries();
  const {
    biweeklySummaries,
    totalCountBiweeklySummaries,
    isLoadingBiweeklySummaries,
    updateBiweeklySummary,
    createOrUpdateBiweeklySummary,
  } = useBiweeklySummaries();
  const {
    monthlySummaries,
    totalCountMonthlySummaries,
    isLoadingMonthlySummaries,
    updateMonthlySummary,
    createOrUpdateMonthlySummary,
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

  // Debug: Track when viewMode changes
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
  const navigate = useNavigate();

  const getInitialRowsPerPage = useCallback(() => {
    if (typeof window !== "undefined") {
      // Total chrome: appbar(64) + page header(110) + selector header(36) + table head(36) + footer(36) + borders/gaps(20)
      const totalChrome = 302;
      const availableHeight = window.innerHeight - totalChrome;
      const rowHeight = 42;
      let rows = Math.floor(availableHeight / rowHeight);
      return Math.max(3, Math.min(100, rows));
    }
    return 25;
  }, []);

  const { search, setSearch, rowsPerPage, setRowsPerPage } =
    useTablePreferences("roles-selector", getInitialRowsPerPage);

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectorTableViewMode', viewMode);
  }, [viewMode]);

  // Handle view mode based on permissions - only check on permission changes
  useEffect(() => {
    const hasRolesPermission = userPermissions.includes(PERMISSIONS.VIEW_ROLES);
    const hasSchedulePermission = userPermissions.includes(PERMISSIONS.VIEW_SCHEDULES);
    
    // Si no tiene permisos para roles pero sí para horarios, y está en vista de empleados, cambiar a horarios
    if (!hasRolesPermission && hasSchedulePermission && viewMode === 'employee') {
      setViewMode('schedule');
    }
  }, [userPermissions, viewMode]);

  // Fetch employees, schedules, and hours worked on mount (only if not already loaded)
  useEffect(() => {
    if (employees.length === 0) {
      dispatch(fetchEmployees());
    }
  }, [employees.length, dispatch]);

  useEffect(() => {
    if (schedules.length === 0) {
      dispatch(fetchSchedules());
    }
  }, [schedules.length, dispatch]);

  useEffect(() => {
    if (hoursWorked.length === 0) {
      dispatch(fetchHoursWorked());
    }
  }, [hoursWorked.length, dispatch]);

  // Initialize filteredSchedules with all schedules - only when explicitly needed
  const isLoading =
    isLoadingEmployees ||
    isLoadingSchedules ||
    isLoadingHoursWorked ||
    isLoadingWeeklySummaries ||
    isLoadingBiweeklySummaries ||
    isLoadingMonthlySummaries;

  // Memoized filtered employees to prevent unnecessary re-renders
  const memoizedFilteredEmployees = useMemo(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedSearch = normalizeString(search).toLowerCase();
    
    const result = employees.filter((employee) =>
      normalizeString(`${employee.firstName} ${employee.lastName}`)
        .toLowerCase()
        .includes(normalizedSearch)
    );
    return result;
  }, [search, employees]);

  // Memoized filtered schedules to prevent unnecessary re-renders
  const memoizedFilteredSchedules = useMemo(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedSearch = normalizeString(search).toLowerCase();
    
    const result = schedules.filter((schedule) =>
      normalizeString(schedule.label)
        .toLowerCase()
        .includes(normalizedSearch)
    );
    return result;
  }, [search, schedules]);



  // Memoize current week dates to prevent recalculation
  const currentWeekDates = useMemo(() => getCurrentWeekDates(weekOffset), [weekOffset]);

  // Update week, biweek, month, and year based on week offset
  useEffect(() => {
    if (currentWeekDates.length > 0) {
      const firstDayOfWeek = new Date(currentWeekDates[0].date);
      const newWeekNumber = getWeekNumber(firstDayOfWeek);
      const newBiweekNumber = getBiweekNumber(firstDayOfWeek);
      const newMonth = getMonthNumber(firstDayOfWeek);
      const newYear = firstDayOfWeek.getFullYear();

      setCurrentWeekNumber(newWeekNumber);
      setCurrentBiweekNumber(newBiweekNumber);
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    }
  }, [currentWeekDates]);

  // Handle date picker change and update week offset
  const handleDateChange = useCallback((newDate: Date | null) => {
    if (!newDate) return;
    
    setFirstDayOfWeek(newDate);
    
    // Debounce preference update to avoid blocking UI
    requestAnimationFrame(() => {
      const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
      setPreferencesObject(preferencesKey, {
        ...prefs,
        date: newDate.toISOString(),
      });
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
    const startTime = performance.now();
    // Lightweight calculation - just update the summaries
    // The actual data is already in Redux, we just compute the totals
    const calculateTotalHoursForRange = (
      rangeStart: Date,
      rangeEnd: Date,
    ) => {
      let totalHours = 0;
      for (const hw of hoursWorked) {
        if (hw.employeeId !== employeeId) continue;
        const hwDate = new Date(hw.date);
        if (hwDate < rangeStart || hwDate > rangeEnd) continue;
        
        const schedule = schedules.find((s) => s.id === hw.scheduleId);
        if (schedule) {
          totalHours += "hours" in hw && typeof hw.hours === "number" ? hw.hours : schedule.hours;
        }
      }
      return totalHours;
    };

    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    const weekNumber = getWeekNumber(date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Calculate all three summaries in parallel
    const totalWeeklyHours = calculateTotalHoursForRange(weekStart, weekEnd);
    const biweekNumber = getBiweekNumber(date);
    const { startDate: biweekStart, endDate: biweekEnd } = getBiweeklyDates(year, biweekNumber);
    const totalBiweeklyHours = calculateTotalHoursForRange(biweekStart, biweekEnd);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const totalMonthlyHours = calculateTotalHoursForRange(monthStart, monthEnd);

    // Update all summaries
    const existingWeeklySummary = weeklySummaries.find(
      (ws) => ws.employeeId === employeeId && ws.weekNumber === weekNumber && ws.year === year
    );
    if (existingWeeklySummary) {
      await updateWeeklySummary(existingWeeklySummary.id, { employeeId, weekNumber, month, year, totalHours: totalWeeklyHours });
    } else {
      await createOrUpdateWeeklySummary({ employeeId, weekNumber, month, year, totalHours: totalWeeklyHours });
    }

    const existingBiweeklySummary = biweeklySummaries.find(
      (bs) => bs.employeeId === employeeId && bs.biweekNumber === biweekNumber && bs.year === year
    );
    if (existingBiweeklySummary) {
      await updateBiweeklySummary(existingBiweeklySummary.id, { employeeId, biweekNumber, month, year, totalHours: totalBiweeklyHours });
    } else {
      await createOrUpdateBiweeklySummary({ employeeId, biweekNumber, month, year, totalHours: totalBiweeklyHours });
    }

    const existingMonthlySummary = monthlySummaries.find(
      (ms) => ms.employeeId === employeeId && ms.month === month && ms.year === year
    );
    if (existingMonthlySummary) {
      await updateMonthlySummary(existingMonthlySummary.id, { employeeId, month, year, totalHours: totalMonthlyHours });
    } else {
      await createOrUpdateMonthlySummary({ employeeId, month, year, totalHours: totalMonthlyHours });
    }
    const endTime = performance.now();
  }, [hoursWorked, schedules, weeklySummaries, biweeklySummaries, monthlySummaries, updateWeeklySummary, createOrUpdateWeeklySummary, updateBiweeklySummary, createOrUpdateBiweeklySummary, updateMonthlySummary, createOrUpdateMonthlySummary]);

  // Memoize backfill dependencies to prevent unnecessary re-execution
  const backfillDependencies = useMemo(() => ({
    employeesLength: employees.length,
    schedulesLength: schedules.length,
    hoursWorkedLength: hoursWorked.length,
    currentBiweekNumber,
    currentMonth,
    currentYear,
    biweeklySummariesLength: biweeklySummaries.length,
    monthlySummariesLength: monthlySummaries.length,
  }), [employees.length, schedules.length, hoursWorked.length, currentBiweekNumber, currentMonth, currentYear, biweeklySummaries.length, monthlySummaries.length]);

  // Disabled backfill useEffect to prevent performance issues
  // This effect has too many dependencies and runs heavy async operations repeatedly
  // TODO: Implement a more efficient backfill strategy if needed
  /*
  useEffect(() => {
    const backfillCurrentPeriodSummaries = async () => {
      if (
        backfillDependencies.employeesLength === 0 ||
        backfillDependencies.schedulesLength === 0 ||
        backfillDependencies.hoursWorkedLength === 0 ||
        !backfillDependencies.currentBiweekNumber ||
        !backfillDependencies.currentMonth ||
        !backfillDependencies.currentYear
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
        backfillDependencies.currentYear,
        backfillDependencies.currentBiweekNumber,
      );
      const monthStart = new Date(backfillDependencies.currentYear, backfillDependencies.currentMonth - 1, 1);
      const monthEnd = new Date(backfillDependencies.currentYear, backfillDependencies.currentMonth, 0);

      const biweeklyPromises = employees
        .filter(
          (employee) =>
            !biweeklySummaries.some(
              (bs) =>
                bs.employeeId === employee.id &&
                bs.biweekNumber === backfillDependencies.currentBiweekNumber &&
                bs.year === backfillDependencies.currentYear,
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
            biweekNumber: backfillDependencies.currentBiweekNumber,
            month: backfillDependencies.currentMonth,
            year: backfillDependencies.currentYear,
            totalHours,
          });
        });

      const monthlyPromises = employees
        .filter(
          (employee) =>
            !monthlySummaries.some(
              (ms) =>
                ms.employeeId === employee.id &&
                ms.month === backfillDependencies.currentMonth &&
                ms.year === backfillDependencies.currentYear,
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
            month: backfillDependencies.currentMonth,
            year: backfillDependencies.currentYear,
            totalHours,
          });
        });

      await Promise.all([...biweeklyPromises, ...monthlyPromises]);
    };

    void backfillCurrentPeriodSummaries();
  }, [backfillDependencies, employees, schedules, hoursWorked, biweeklySummaries, monthlySummaries, createOrUpdateBiweeklySummary, createOrUpdateMonthlySummary]);
  */

  const handleChange = useCallback((event: SelectChangeEvent<string>, employeeId: number, date: Date) => {
    if (event.target.value === "Other") return;

    const selectedSchedule = schedules.find(
      (schedule) => schedule.label === event.target.value && schedule.days.includes(getDayName(date))
    );

    if (!selectedSchedule) return;

    const formattedDate = format(date, "yyyy-MM-dd");
    const existingRecord = hoursWorked.find(
      (record) => record.employeeId === employeeId && format(new Date(record.date), "yyyy-MM-dd") === formattedDate
    );

    const hoursWorkedEntry = {
      ...(existingRecord ? { id: existingRecord.id } : {}),
      employeeId,
      date: date.toISOString(),
      scheduleId: selectedSchedule.id,
    };

    dispatch(createOrUpdateHoursWorked(hoursWorkedEntry)).then(() => {
      recalculateEmployeeWeeklySummary(employeeId, date, hoursWorkedEntry);
    });
  }, [schedules, hoursWorked, dispatch, recalculateEmployeeWeeklySummary]);

  const handleAdjustTime = useCallback(async (employeeId: number, condition: "add" | "subtract", timeAdjustment: number) => {
    if (!timeAdjustment || timeAdjustment < 0) return;
    const adjustment = condition === "add" ? timeAdjustment : -timeAdjustment;

    const existingWeeklySummary = weeklySummaries.find(
      (ws) => ws.employeeId === employeeId && ws.weekNumber === currentWeekNumber && ws.month === currentMonth && ws.year === currentYear
    );
    const existingBiweeklySummary = biweeklySummaries.find(
      (bs) => bs.employeeId === employeeId && bs.biweekNumber === currentBiweekNumber && bs.month === currentMonth && bs.year === currentYear
    );
    const existingMonthlySummary = monthlySummaries.find(
      (ms) => ms.employeeId === employeeId && ms.month === currentMonth && ms.year === currentYear
    );

    const updates = [];
    if (existingWeeklySummary) {
      updates.push(updateWeeklySummary(existingWeeklySummary.id, { employeeId, weekNumber: currentWeekNumber, month: currentMonth, year: currentYear, totalHours: Math.max(0, existingWeeklySummary.totalHours + adjustment) }));
    } else {
      updates.push(createOrUpdateWeeklySummary({ employeeId, weekNumber: currentWeekNumber, month: currentMonth, year: currentYear, totalHours: Math.max(0, adjustment) }));
    }
    if (existingBiweeklySummary) {
      updates.push(updateBiweeklySummary(existingBiweeklySummary.id, { employeeId, biweekNumber: currentBiweekNumber, month: currentMonth, year: currentYear, totalHours: Math.max(0, existingBiweeklySummary.totalHours + adjustment) }));
    } else {
      updates.push(createOrUpdateBiweeklySummary({ employeeId, biweekNumber: currentBiweekNumber, month: currentMonth, year: currentYear, totalHours: Math.max(0, adjustment) }));
    }
    if (existingMonthlySummary) {
      updates.push(updateMonthlySummary(existingMonthlySummary.id, { employeeId, month: currentMonth, year: currentYear, totalHours: Math.max(0, existingMonthlySummary.totalHours + adjustment) }));
    } else {
      updates.push(createOrUpdateMonthlySummary({ employeeId, month: currentMonth, year: currentYear, totalHours: Math.max(0, adjustment) }));
    }
    await Promise.all(updates);
  }, [currentWeekNumber, currentBiweekNumber, currentMonth, currentYear, weeklySummaries, biweeklySummaries, monthlySummaries, updateWeeklySummary, createOrUpdateWeeklySummary, updateBiweeklySummary, createOrUpdateBiweeklySummary, updateMonthlySummary, createOrUpdateMonthlySummary]);

  const handleNextWeek = useCallback(() => {
    setWeekOffset(prev => prev + 1);
    setFirstDayOfWeek(getFirstDayOfWeek(weekOffset + 1));
  }, [weekOffset]);

  const handlePreviousWeek = useCallback(() => {
    setWeekOffset(prev => prev - 1);
    setFirstDayOfWeek(getFirstDayOfWeek(weekOffset - 1));
  }, [weekOffset]);

  const handleCurrentWeek = useCallback(() => {
    setWeekOffset(0);
    setFirstDayOfWeek(new Date());
  }, []);

  const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

  const handleOpenExportDialog = useCallback((type: "excel" | "pdf") => {
    setExportType(type);
    setOpenExportDialog(true);
  }, []);

  const handleCloseAddRoleModal = useCallback(() => {
    setOpenAddRoleModal(false);
  }, []);

  const handleGenerateHours = useCallback(async (config: AutoGenerateConfig) => {
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
    }, [
      schedules,
      firstDayOfWeek,
      employees,
      dispatch,
      createOrUpdateWeeklySummary,
      showNotification,
      setOpenAddRoleModal,
      setIsGeneratingHours,
    ]);
  const handleModalConfigChange = useCallback((config: AutoGenerateConfig) => {
    setCurrentModalConfig(config);
  }, []);

  const handleGenerateFromDialog = useCallback(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Note: handleGenerateHours intentionally not included to always access current data
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
  }, [currentModalConfig, userPermissions, showNotification, handleGenerateHours]);

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
        memoizedFilteredEmployees,
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
  }, [userPermissions, handleOpenExportDialog]);

  return (
    <>
    <Box sx={{ height: "calc(100vh - 64px - 32px)", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
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
              py: { xs: 1, sm: 1.5 },
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
                      ? `${memoizedFilteredEmployees.length} empleados` 
                      : `${memoizedFilteredSchedules.length} horarios`}
                  </Typography>
                </Box>
              </Box>

              {/* Export Speed Dial */}
              {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES) &&
                userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES) && (
                  <Box sx={{ ...exportSpeedDialBoxStyles, minHeight: 'auto' }}>
                    {(viewMode === 'employee' ? memoizedFilteredEmployees.length > 0 : memoizedFilteredSchedules.length > 0) && (
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
                {(viewMode === 'employee' ? memoizedFilteredEmployees : memoizedFilteredSchedules) && (
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
                </PremiumTooltip>

                {/* Current Week Button */}
                <PremiumTooltip title={MANAGEMENT.TOOLTIP_CURRENT_WEEK}>
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
                </PremiumTooltip>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: "auto", p: 0 }}>
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
              memoizedFilteredEmployees.length > 0 ? (
                <SelectorTableComponent
                  key={`roles-${viewMode}-${memoizedFilteredEmployees.length}-${schedules.length}`}
                  filteredEmployees={memoizedFilteredEmployees}
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
              memoizedFilteredSchedules.length > 0 ? (
                <SelectorTableComponent
                  key={`roles-${viewMode}-${memoizedFilteredSchedules.length}-${memoizedFilteredEmployees.length}`}
                  filteredEmployees={memoizedFilteredEmployees}
                  schedules={memoizedFilteredSchedules}
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
          <AppModal
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
      </Box>
      
      <Dialog
        open={openAddRoleModal}
        onClose={handleCloseAddRoleModal}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: {
            border: "2px solid #fff",
            borderRadius: 3,
            minHeight: "48vh",
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
    </>
  );
};

export default RolesPage;
