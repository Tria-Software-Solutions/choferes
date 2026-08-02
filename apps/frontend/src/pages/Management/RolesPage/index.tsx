import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  deleteHoursWorked,
} from "../../../store/slices/hoursWorkedSlice";
import { useWeeklySummaries } from "../../../hooks/useWeeklySummary";
import { useBiweeklySummaries } from "../../../hooks/useBiweeklySummary";
import { useMonthlySummaries } from "../../../hooks/useMonthlySummary";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import WeeklyBoard from "../../../components/Board/WeeklyBoard/WeeklyBoard.component";
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
  getInvolvedPeriods,
  getMonthNumber,
  getWeekNumberAndYear,
  isValidDateForSelect,
  DayEntry,
} from "../../../utils/dates";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { SELECTOR_TABLE } from "../../../constants/constants";
import { Download, ChevronLeft, ChevronRight, X, Search, RotateCcw } from "lucide-react";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { NotepadText, Sparkles } from "lucide-react";
import AutoGenerateModal, { AutoGenerateConfig } from "../../../components/Modal/AutoGenerateModal/AutoGenerateModal.component";
import {
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
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
import { PdfIcon, ExcelIcon } from "../../../components/Icons/FileIcons";
import { capitalizeFirstLetter } from "../../../utils/string";
import { getScheduleHours, sortSchedulesByType } from "../../../utils/schedule";
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
  const { schedules, isLoadingSchedules, customOrderIds } = useSelector(
    (state: RootState) => state.schedules
  );
  const { hoursWorked, isLoadingHoursWorked } = useSelector(
    (state: RootState) => state.hoursWorked
  );
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const hoursWorkedRef = useRef(hoursWorked);
  useEffect(() => { hoursWorkedRef.current = hoursWorked; }, [hoursWorked]);
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
  const weeklySummariesRef = useRef(weeklySummaries);
  const biweeklySummariesRef = useRef(biweeklySummaries);
  const monthlySummariesRef = useRef(monthlySummaries);
  useEffect(() => { weeklySummariesRef.current = weeklySummaries; }, [weeklySummaries]);
  useEffect(() => { biweeklySummariesRef.current = biweeklySummaries; }, [biweeklySummaries]);
  useEffect(() => { monthlySummariesRef.current = monthlySummaries; }, [monthlySummaries]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<Date | null>(() => {
    const prefs = getPreferencesObject(preferencesKey, defaultPreferences);
    return prefs.date ? new Date(prefs.date) : new Date();
  });
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

  const { search, setSearch } =
    useTablePreferences("roles-selector", () => 25);

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
    dispatch(fetchEmployees({}));
    dispatch(fetchSchedules({}));
    dispatch(fetchHoursWorked());
  }, [dispatch, location.pathname]);

  // Initialize filteredSchedules with all schedules (sorted by saved custom order)
  useEffect(() => {
    setFilteredSchedules(sortSchedulesByType(schedules, customOrderIds));
  }, [schedules, customOrderIds]);

  const isLoading =
    isLoadingEmployees ||
    isLoadingSchedules ||
    isLoadingHoursWorked ||
    isLoadingWeeklySummaries ||
    isLoadingBiweeklySummaries ||
    isLoadingMonthlySummaries;

  // Smart search: cada categoría se filtra independientemente.
  // Si el texto coincide con empleados → filtra empleados; si no, muestra todos.
  // Si coincide con horarios → filtra horarios; si no, muestra todos.
  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const normalizedSearch = normalizeString(search).toLowerCase().trim();

    if (!normalizedSearch) {
      setFilteredEmployees(employees);
      setFilteredSchedules(sortSchedulesByType(schedules, customOrderIds));
      return;
    }

    // Buscar en empleados — si hay match, filtrar; si no, mostrar todos
    const matchedEmployees = employees.filter((employee) =>
      normalizeString(`${employee.firstName} ${employee.lastName}`)
        .toLowerCase()
        .includes(normalizedSearch)
    );
    setFilteredEmployees(matchedEmployees.length > 0 ? matchedEmployees : employees);

    // Buscar en horarios — si hay match, filtrar; si no, mostrar todos
    const matchedSchedules = schedules.filter((schedule) =>
      normalizeString(schedule.label)
        .toLowerCase()
        .includes(normalizedSearch)
    );
    setFilteredSchedules(
      matchedSchedules.length > 0
        ? sortSchedulesByType(matchedSchedules, customOrderIds)
        : sortSchedulesByType(schedules, customOrderIds)
    );
  }, [search, employees, schedules, customOrderIds]);



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

  const currentWeek: DayEntry[] = getCurrentWeekDates(weekOffset);
  const firstDayOfCurrentWeek = currentWeek.length > 0
    ? new Date(currentWeek[0].isoDate)
    : new Date();
  firstDayOfCurrentWeek.setHours(0, 0, 0, 0);
  const { year: currentWeekYear, weekNumber: currentWeekNumber } =
    getWeekNumberAndYear(firstDayOfCurrentWeek);
  const currentBiweekNumber = getBiweekNumber(firstDayOfCurrentWeek);
  const currentMonth = getMonthNumber(firstDayOfCurrentWeek);
  const currentYear = firstDayOfCurrentWeek.getFullYear();

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
      const employeeHoursWorked = hoursWorkedRef.current.filter((hw) => {
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
            const hwDate = new Date(hw.date);
            const dayName = hwDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
            dayHours = getScheduleHours(schedule, dayName);
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
    const { year: weekIsoYear, weekNumber } = getWeekNumberAndYear(date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const existingWeeklySummary = weeklySummariesRef.current.find(
      (ws) => ws.employeeId === employeeId &&
               ws.weekNumber === weekNumber &&
               ws.year === weekIsoYear
    );

    const weeklySummary = {
      employeeId,
      weekNumber,
      month,
      year: weekIsoYear,
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
    const existingBiweeklySummary = biweeklySummariesRef.current.find(
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
    const existingMonthlySummary = monthlySummariesRef.current.find(
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
    schedules,
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
      const employeeHoursWorked = hoursWorkedRef.current.filter((hw) => {
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
              const hwDate = new Date(hw.date);
              const dayName = hwDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
              dayHours = getScheduleHours(schedule, dayName);
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
        .map(async (employee) => {
          const totalHours = calculateTotalHoursForRange(
            employee.id,
            biweekStart,
            biweekEnd,
          );
          if (totalHours <= 0) {
            return;
          }
          try {
            await createOrUpdateBiweeklySummary({
              employeeId: employee.id,
              biweekNumber: currentBiweekNumber,
              month: currentMonth,
              year: currentYear,
              totalHours,
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(`[backfill] Error creating biweekly summary for employee ${employee.id}:`, error);
          }
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
        .map(async (employee) => {
          const totalHours = calculateTotalHoursForRange(
            employee.id,
            monthStart,
            monthEnd,
          );
          if (totalHours <= 0) {
            return;
          }
          try {
            await createOrUpdateMonthlySummary({
              employeeId: employee.id,
              month: currentMonth,
              year: currentYear,
              totalHours,
            });
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(`[backfill] Error creating monthly summary for employee ${employee.id}:`, error);
          }
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
    value: string,
    employeeId: number,
    date: Date,
    skipRecalc?: boolean,
  ) => {
    if (value === "Other") {
      return;
    }

    // Manejar el caso de "Sin Asignar"
    if (value === SELECTOR_TABLE.UNASSIGNED) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const existingHoursWorkedRecord = hoursWorked.find(
        (record) =>
          record.employeeId === employeeId &&
          format(new Date(record.date), "yyyy-MM-dd") === formattedDate
      );

      if (existingHoursWorkedRecord) {
        // Actualizar el ref inmediatamente para reflejar el borrado
        hoursWorkedRef.current = hoursWorkedRef.current.filter(
          (hw) => hw.id !== existingHoursWorkedRecord.id
        );
        // Actualizar refs de summaries sincrónicamente para UI inmediata
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
        const sched = schedules.find((s) => s.id === existingHoursWorkedRecord.scheduleId);
        const removedHours = sched ? getScheduleHours(sched, dayName) : 0;
        if (removedHours > 0) {
          const { year: wkYr, weekNumber: wkNum } = getWeekNumberAndYear(date);
          const biNum = getBiweekNumber(date);
          const mth = date.getMonth() + 1;
          const yr = date.getFullYear();
          const sub = (h: number) => Math.max(0, h - removedHours);
          weeklySummariesRef.current = weeklySummariesRef.current.map((ws) =>
            ws.employeeId === employeeId && ws.weekNumber === wkNum && ws.year === wkYr
              ? { ...ws, totalHours: sub(Number(ws.totalHours)) }
              : ws,
          );
          biweeklySummariesRef.current = biweeklySummariesRef.current.map((bs) =>
            bs.employeeId === employeeId && bs.biweekNumber === biNum && bs.year === yr
              ? { ...bs, totalHours: sub(Number(bs.totalHours)) }
              : bs,
          );
          monthlySummariesRef.current = monthlySummariesRef.current.map((ms) =>
            ms.employeeId === employeeId && ms.month === mth && ms.year === yr
              ? { ...ms, totalHours: sub(Number(ms.totalHours)) }
              : ms,
          );
        }
        // Eliminar el registro de hoursWorked, luego recalcular TODOS los summaries
        // (weekly, biweekly, monthly) desde cero para evitar inconsistencias.
        dispatch(deleteHoursWorked(existingHoursWorkedRecord.id)).then(async () => {
          // recalculateEmployeeWeeklySummary recalcula los 3 summaries (semanal, quincenal, mensual)
          // usando los datos actualizados de hoursWorked. Es la fuente única de verdad.
          if (!skipRecalc) {
            await recalculateEmployeeWeeklySummary(employeeId, date);
          }
        });
      }
      return;
    }

    const selectedSchedule = schedules.find(
      (schedule) =>
        schedule.label === value &&
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

    // Update HoursWorked (si skipRecalc=true, no recalcular summaries — se hará después desde el popover)
    dispatch(createOrUpdateHoursWorked(hoursWorkedEntry)).then(() => {
      if (!skipRecalc) {
        recalculateEmployeeWeeklySummary(employeeId, date, hoursWorkedEntry);
      }
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
        weeklySummary.year === currentWeekYear
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
            year: currentWeekYear,
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
      
      // Get available schedules for balanced distribution
      const scheduleLabels = [...new Set(availableSchedules.map(s => s.label))];
      
      if (scheduleLabels.length === 0) {
        throw new Error('No hay horarios disponibles para asignar');
      }
      
      // Calculate weekly hours for each schedule to plan distribution
      const scheduleWeeklyHours: Record<string, number> = {};
      
      // Calculate total weekly hours for each schedule label
      scheduleLabels.forEach(label => {
        let totalHours = 0;
        const weekStart = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
        
        for (let i = 0; i < 7; i++) {
          const dayDate = addDays(weekStart, i);
          const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
          
          const daySchedule = availableSchedules.find(s => 
            s.label === label && s.days && s.days.includes(dayName)
          );
          
          if (daySchedule) {
            totalHours += getScheduleHours(daySchedule, dayName);
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
          
          if (minCount >= maxEmployeesPerSchedule) {
            // All schedules at max capacity, just continue distributing
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
          const { year: weekStartIsoYear, weekNumber: weekStartWeek } =
            getWeekNumberAndYear(weekStartDate);
          const weeklySummary = {
            employeeId,
            weekNumber: weekStartWeek,
            month: weekStartDate.getMonth() + 1,
            year: weekStartIsoYear,
            totalHours: 0,
          };
          await createOrUpdateWeeklySummary(weeklySummary);
          return;
        }
        
        // Find the minimum daily hours available in schedules (per-day)
        const minDailyHours = Math.min(...Array.from({ length: 7 }, (_, i) => {
          const d = addDays(current, i);
          const dayN = d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
          const dayS = availableSchedules.find(s => s.label === assignedScheduleLabel && s.days.includes(dayN));
          return dayS ? getScheduleHours(dayS, dayN) : Infinity;
        }));
        
        // If target hours are less than the minimum daily hours, don't assign anything
        if (targetWeeklyHours < minDailyHours) {
          totalWeeklyHours = 0;
          // Still create/update the weekly summary with 0 hours
          const weekStartDate = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
          const { year: weekStartIsoYear, weekNumber: weekStartWeek } =
            getWeekNumberAndYear(weekStartDate);
          const weeklySummary = {
            employeeId,
            weekNumber: weekStartWeek,
            month: weekStartDate.getMonth() + 1,
            year: weekStartIsoYear,
            totalHours: 0,
          };
          await createOrUpdateWeeklySummary(weeklySummary);
          return;
        }
        
        if (needsRedistribution) {
            
          // Apply maximum hours limit
          const maxHoursPerWeek = config.maxHoursPerWeek || 48;
          const limitedTargetHours = Math.min(targetWeeklyHours, maxHoursPerWeek);
            
          // Find the schedule's daily hours (use the first available day's per-day hours)
          const mondaySchedule = availableSchedules.find(s => 
            s.label === assignedScheduleLabel && 
            s.days && s.days.includes('monday')
          );
          const scheduleDailyHours = mondaySchedule ? getScheduleHours(mondaySchedule, 'monday') : 0;
          
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
                const dayActualHours = getScheduleHours(daySchedule, dayName);
                // Check if adding this day's hours would exceed the limit
                if (accumulatedHours + dayActualHours <= limitedTargetHours) {
                  // Assign the schedule for this day
                  const hoursWorkedEntry = {
                    employeeId,
                    date: dayDate.toISOString(),
                    scheduleId: daySchedule.id,
                  };
                  redistributedEntries.push(hoursWorkedEntry);
                  totalWeeklyHours += dayActualHours;
                  accumulatedHours += dayActualHours;
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
              const dayActualHours = getScheduleHours(daySchedule, dayName);
              const hoursWorkedEntry = {
                employeeId,
                date: dayDate.toISOString(),
                scheduleId: daySchedule.id,
              };
              weekDays.push(hoursWorkedEntry);
              
              // Add to total weekly hours (using per-day hours)
              totalWeeklyHours += dayActualHours;
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
          
          const { year: weekStartIsoYear, weekNumber: weekStartWeek } =
            getWeekNumberAndYear(weekStartDate);
          const weeklySummary = {
            employeeId,
            weekNumber: weekStartWeek,
            month: weekStartDate.getMonth() + 1,
            year: weekStartIsoYear,
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
          currentWeekYear,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          getInvolvedPeriods(currentWeek)
        );
        row["Horas extra"] = calculateOvertime(
          employee,
          "weekly",
          currentWeek,
          currentWeekNumber,
          currentBiweekNumber,
          currentMonth,
          currentWeekYear,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          getInvolvedPeriods(currentWeek)
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
      showNotification("Error al exportar los datos", {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = useMemo(() => {
    const options = [];
    if (userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES)) {
      options.push({
        label: "Exportar a Excel",
        icon: <ExcelIcon size={20} />,
        onClick: () => handleOpenExportDialog("excel"),
      });
    }
    if (userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES)) {
      options.push({
        label: "Exportar a PDF",
        icon: <PdfIcon size={20} />,
        onClick: () => handleOpenExportDialog("pdf"),
      });
    }
    return options;
  }, [userPermissions]);

  return (
    <Box className="scrollable-content" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", pb: 0, pt: 0, px: 0 }}>
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
            mx: { xs: 1, sm: 1.5, md: 2 },
            mb: 3,
            mt: 0,
          }}
        >
          {/* Simple Header */}
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              flexShrink: 0,
              borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            {/* Title Row */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
              flexWrap="wrap"
              gap={1}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <NotepadText size={20} strokeWidth={1.5} />
                </Box>
                <Box>
                  <Typography
                    variant={isSmallScreen ? "h6" : "h5"}
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.15rem" },
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
                      fontSize: "0.7rem",
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
                  <Box sx={{ ...exportSpeedDialBoxStyles, minHeight: 'auto', ml: 'auto' }}>
                    {(viewMode === 'employee' ? filteredEmployees.length > 0 : filteredSchedules.length > 0) && (
                      <SpeedDialComponent
                        actions={exportOptions}
                        mainIcon={<Download size={18} strokeWidth={1.5} />}
                        openIcon={<X size={18} strokeWidth={1.5} />}
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
              gap={1.5}
            >
              {/* Search - busca empleados Y horarios */}
              <Box flex={1} maxWidth={{ sm: "280px" }}>
                <SearchBarComponent
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />
              </Box>

              {/* Date Picker and Navigation */}
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                gap={0.75}
                width={{ xs: "100%", sm: "auto" }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                  gap={0.5}
                  flexWrap="wrap"
                  flexShrink={0}
                >
                  {/* Previous Week Button */}
                  <PremiumTooltip title={MANAGEMENT.TOOLTIP_PREV_WEEK}>
                    <IconButton
                      onClick={handlePreviousWeek}
                      size="small"
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                        },
                      }}
                    >
                      <ChevronLeft size={18} strokeWidth={1.5} />
                    </IconButton>
                  </PremiumTooltip>

                  {/* Date Picker (flexes in the same row on mobile) */}
                  <Box
                    sx={{
                      flex: { xs: 1, sm: "0 0 auto" },
                      display: "flex",
                      justifyContent: { xs: "center", sm: "flex-end" },
                      minWidth: 0,
                    }}
                  >
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <DatePicker
                      value={firstDayOfWeek}
                      maxDate={nextWeekEnd}
                      views={["year", "month", "day"]}
                      format="d MMM yyyy"
                      slots={{ toolbar: () => null }}
                      slotProps={{
                        textField: {
                          fullWidth: false,
                          required: true,
                          variant: "standard",
                          sx: {
                            width: { xs: "100%", sm: "150px", md: "170px" },
                            '& .MuiInputBase-root': {
                              height: '36px',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              '&:before, &:after': { 
                                display: 'none' 
                              },
                              '&:hover:not(.Mui-disabled):before': { 
                                display: 'none' 
                              },
                            },
                            '& input': {
                              textAlign: 'center',
                              cursor: 'pointer',
                              padding: '4px 0',
                            },
                          },
                        },
                      }}
                      closeOnSelect
                      onChange={handleDateChange}
                    />
                  </LocalizationProvider>
                  </Box>

                  {/* Next Week Button */}
                  <PremiumTooltip title={MANAGEMENT.TOOLTIP_NEXT_WEEK}>
                    <span>
                      <IconButton
                        disabled={
                          !isValidDateForSelect(
                            new Date(
                              getCurrentWeekDates(weekOffset + 1)[0].isoDate
                            )
                          )
                        }
                        onClick={handleNextWeek}
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                          },
                          '&.Mui-disabled': {
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          },
                        }}
                      >
                        <ChevronRight size={18} strokeWidth={1.5} />
                      </IconButton>
                    </span>
                  </PremiumTooltip>

                  {/* Current Week Button */}
                  <PremiumTooltip title={MANAGEMENT.TOOLTIP_CURRENT_WEEK}>
                    <span>
                      <IconButton
                        disabled={weekOffset === 0}
                        onClick={handleCurrentWeek}
                        size="small"
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                          },
                          '&.Mui-disabled': {
                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                          },
                        }}
                      >
                        <RotateCcw size={16} strokeWidth={1.5} />
                      </IconButton>
                    </span>
                  </PremiumTooltip>
                </Box>
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
            
            return (
              <WeeklyBoard
                filteredEmployees={filteredEmployees}
                schedules={viewMode === 'schedule' ? filteredSchedules : schedules}
                hoursWorked={hoursWorked}
                weeklySummaries={weeklySummaries}
                biweeklySummaries={biweeklySummaries}
                monthlySummaries={monthlySummaries}
                weekOffset={weekOffset}
                weekNumber={currentWeekNumber}
                biweekNumber={currentBiweekNumber}
                month={currentMonth}
                year={currentWeekYear}
                handleChange={handleChange}
                handleAdjustTime={handleAdjustTime}
                recalculateEmployeeWeeklySummary={recalculateEmployeeWeeklySummary}
                permissions={userPermissions}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            );
        })()}
          </Box>
          <DialogComponent
            open={openExportDialog}
            onClose={() => {
              setOpenExportDialog(false);
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
