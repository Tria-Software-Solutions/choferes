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
import { recalculateSummaries } from "../../../services/hoursWorkedService";
import { useWeeklySummaries } from "../../../hooks/useWeeklySummary";
import { useBiweeklySummaries } from "../../../hooks/useBiweeklySummary";
import { useMonthlySummaries } from "../../../hooks/useMonthlySummary";
import SearchBarComponent from "../../../components/SearchBar/SearchBar.component";
import WeeklyBoard from "../../../components/Board/WeeklyBoard/WeeklyBoard.component";
import ExportMenu from "../../../components/ExportMenu/ExportMenu.component";
import { es } from "date-fns/locale";
import {
  addWeeks,
  differenceInCalendarWeeks,
  endOfWeek,
  startOfWeek,
  format,
} from "date-fns";
import {
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { exportFileFormattedDate, exportTable, PdfHeaderIcon, PdfLegendEntry } from "../../../utils/export";
import { ICON_PERSON, ICON_CLOCK, ICON_CLOCK_PLUS } from "../../../utils/pdfIcons";
import {
  getBiweekNumber,
  getCurrentWeekDates,
  getDayName,
  getFirstDayOfWeek,
  getInvolvedPeriods,
  getMonthNumber,
  getWeekNumberAndYear,
  isValidDateForSelect,
  DayEntry,
} from "../../../utils/dates";
import APPBAR_MENU from "../../../constants/appbar.constants";
import NavIcon from "../../../components/NavIcon/NavIcon.component";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import { PERMISSION_CODES } from "../../../constants/permissions.constants";
import MANAGEMENT from "../../../constants/management.constants";
import { SELECTOR_TABLE } from "../../../constants/constants";
import { IconLockAccess, IconTimeline, IconUsers } from "@tabler/icons-react";
import DateNavigator from "../../../components/DateNavigator/DateNavigator.component";
import {
  EmptyState,
  LoadingState,
  PageBody,
  PageCard,
  PageContainer,
  PageHeader,
} from "../../../components/Layout";
import { useLocation } from "react-router-dom";
import SegmentedToggle from "../../../components/SegmentedToggle/SegmentedToggle.component";
import {
  NameFormatProvider,
  formatEmployeeName,
  getStoredNameFormat,
  setStoredNameFormat,
  type EmployeeNameFormat,
} from "../../../context/NameFormatContext";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import {
  getPreferencesObject,
  setPreferencesObject,
} from "../../../utils/persistentState";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { userPermissions } = useAuthContext();
  const { showNotification } = useAppNotifications();
  // The recalculate endpoint is guarded by `employee-hours:edit`, so read-only
  // users (e.g. a Supervisor, who only has `roles:view` + `employee-hours:view`)
  // must not call it: they just read the summaries the server already computed.
  const canRecalculate = userPermissions.includes(PERMISSION_CODES.EDIT_EMPLOYEE_HOURS);
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
  // Cómo mostrar los nombres en el tablero: nombre completo o preferido.
  const [nameFormat, setNameFormat] = useState<EmployeeNameFormat>(() => getStoredNameFormat());
  const handleNameFormat = (format: EmployeeNameFormat) => {
    setNameFormat(format);
    setStoredNameFormat(format);
  };

  // El buscador se recuerda entre navegaciones.
  const { search, setSearch } = useTablePreferences("roles-selector", () => 25);

  // El board de horas muestra siempre solo empleados activos: los egresados no
  // deben recibir nuevas asignaciones, así que no hace falta un filtro de estado.
  const visibleEmployees = useMemo(
    () => employees.filter((employee) => employee.isActive !== false),
    [employees],
  );
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const hoursWorkedRef = useRef(hoursWorked);
  useEffect(() => { hoursWorkedRef.current = hoursWorked; }, [hoursWorked]);
  const {
    weeklySummaries,
    isLoadingWeeklySummaries,
    getWeeklySummaries,
    updateWeeklySummary,
    createOrUpdateWeeklySummary,
  } = useWeeklySummaries();
  const {
    biweeklySummaries,
    isLoadingBiweeklySummaries,
    getBiweeklySummaries,
    createOrUpdateBiweeklySummary,
    updateBiweeklySummary,
  } = useBiweeklySummaries();
  const {
    monthlySummaries,
    isLoadingMonthlySummaries,
    getMonthlySummaries,
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
  const [viewMode, setViewMode] = useState<'employee' | 'schedule'>(() => {
    const savedViewMode = localStorage.getItem('selectorTableViewMode');
    const hasRolesPermission = userPermissions.includes(PERMISSION_CODES.VIEW_ROLES);
    const hasSchedulePermission = userPermissions.includes(PERMISSION_CODES.VIEW_SCHEDULES);
    
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

  const location = useLocation();

  // Save viewMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectorTableViewMode', viewMode);
  }, [viewMode]);

  // Handle view mode based on permissions
  useEffect(() => {
    const hasRolesPermission = userPermissions.includes(PERMISSION_CODES.VIEW_ROLES);
    const hasSchedulePermission = userPermissions.includes(PERMISSION_CODES.VIEW_SCHEDULES);
    
    // Si no tiene permisos para roles pero sí para horarios, y está en vista de empleados, cambiar a horarios
    if (!hasRolesPermission && hasSchedulePermission && viewMode === 'employee') {
      setViewMode('schedule');
    }
  }, [userPermissions, viewMode]);

  // Fetch employees and schedules on mount; hours worked are fetched by the
  // visible week range effect below.
  useEffect(() => {
    dispatch(fetchEmployees({}));
    dispatch(fetchSchedules({}));
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
      setFilteredEmployees(visibleEmployees);
      setFilteredSchedules(sortSchedulesByType(schedules, customOrderIds));
      return;
    }

    // Buscar en empleados — si hay match, filtrar; si no, mostrar todos
    const matchedEmployees = visibleEmployees.filter((employee) =>
      normalizeString(`${employee.firstName} ${employee.lastName}`)
        .toLowerCase()
        .includes(normalizedSearch)
    );
    setFilteredEmployees(matchedEmployees.length > 0 ? matchedEmployees : visibleEmployees);

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
  }, [search, visibleEmployees, schedules, customOrderIds]);



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

  // Fetch hours worked only for the visible week (the server filters by date
  // range). This keeps the board lightweight instead of loading the whole
  // history, which previously capped at 50 rows and made data appear lost.
  const weekStartDate = currentWeek.length > 0 ? currentWeek[0].isoDate : undefined;
  const weekEndDate = currentWeek.length > 6 ? currentWeek[6].isoDate : undefined;

  useEffect(() => {
    if (!weekStartDate || !weekEndDate) return;
    dispatch(fetchHoursWorked({ dateFrom: weekStartDate, dateTo: weekEndDate }));
  }, [dispatch, weekStartDate, weekEndDate, location.pathname]);

  // Refresh the three summary collections from the server after a recalc.
  const refreshSummaries = useCallback(async () => {
    await Promise.all([
      getWeeklySummaries(),
      getBiweeklySummaries(),
      getMonthlySummaries(),
    ]);
  }, [getWeeklySummaries, getBiweeklySummaries, getMonthlySummaries]);

  // Server-side recalculation of weekly/biweekly/monthly summaries. The server
  // recomputes from the full hours_worked history (source of truth), so the
  // client never has to hold the whole dataset.
  const recalculateEmployeeWeeklySummary = useCallback(async (
    employeeId: number,
    date?: Date
  ) => {
    try {
      await recalculateSummaries({
        employeeId,
        date: date ? new Date(date).toISOString() : undefined,
      });
      await refreshSummaries();
    } catch {
      showNotification(
        "No se pudieron recalcular los totales. Verifica tu conexión e inténtalo de nuevo.",
        { severity: "warning", duration: 5000 },
      );
    }
  }, [refreshSummaries, showNotification]);

  useEffect(() => {
    // Keep the summaries of the current period in sync with the server. Runs
    // once the initial data is loaded (replaces the old client-side backfill);
    // individual recalculations happen server-side on every assignment change.
    // Read-only users only refresh: the write endpoint would answer 403.
    let cancelled = false;
    const syncCurrentPeriodSummaries = async () => {
      if (employees.length === 0 || schedules.length === 0) {
        return;
      }
      try {
        if (canRecalculate) {
          await recalculateSummaries({});
        }
        if (!cancelled) {
          await refreshSummaries();
        }
      } catch {
        // Non-fatal: totals will sync on the next assignment change.
      }
    };
    void syncCurrentPeriodSummaries();
    return () => {
      cancelled = true;
    };
  }, [canRecalculate, employees.length, schedules.length, refreshSummaries]);

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
          String(record.date).slice(0, 10) === formattedDate
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
        dispatch(deleteHoursWorked(existingHoursWorkedRecord.id))
          .then(async () => {
            // recalculateEmployeeWeeklySummary recalcula los 3 summaries (semanal, quincenal, mensual)
            // en el servidor, que es la fuente única de verdad.
            if (!skipRecalc) {
              await recalculateEmployeeWeeklySummary(employeeId, date);
            }
          })
          .catch(() => {
            showNotification(
              "No se pudo eliminar el registro de horas. Verifica tu conexión e inténtalo de nuevo.",
              { severity: "error", duration: 5000 },
            );
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
        String(record.date).slice(0, 10) === formattedDate
    );

    // Create/update HoursWorked entry
    const hoursWorkedEntry = {
      ...(existingHoursWorkedRecord ? { id: existingHoursWorkedRecord.id } : {}),
      employeeId,
      date: date.toISOString(),
      scheduleId: selectedSchedule.id,
    };

    // Update HoursWorked (si skipRecalc=true, no recalcular summaries — se hará después desde el popover)
    dispatch(createOrUpdateHoursWorked(hoursWorkedEntry))
      .then(() => {
        if (!skipRecalc) {
          recalculateEmployeeWeeklySummary(employeeId, date);
        }
      })
      .catch(() => {
        showNotification(
          "No se pudo guardar el registro de horas. Verifica tu conexión e inténtalo de nuevo.",
          { severity: "error", duration: 5000 },
        );
      });
  };

  const handleAdjustTime = async (
    employeeId: number,
    condition: "add" | "subtract",
    timeAdjustment: number
  ) => {
    if (!timeAdjustment || timeAdjustment < 0) return;

    const adjustment = condition === "add" ? timeAdjustment : -timeAdjustment;

    // The visible week can span two periods (biweek/month/year boundary). A
    // manual adjustment must apply to the period where the employee actually
    // has data, otherwise it creates a summary in the wrong period (e.g. hours
    // on Sunday Aug 16 belong to quincena 16, not to Monday's quincena 15).
    // Pick the employee's existing summary among the involved periods
    // (Monday-first order), falling back to the visible week's own period.
    const involved = getInvolvedPeriods(currentWeek);

    const pickExistingSummary = <
      S extends { employeeId: number; year: number },
    >(
      summaries: S[],
      periods: Array<{ year: number; [key: string]: number }>,
      matches: (summary: S, period: { year: number; [key: string]: number }) => boolean,
    ) =>
      summaries.find((summary) =>
        periods.some(
          (period) => summary.employeeId === employeeId && matches(summary, period),
        ),
      );

    const existingWeeklySummary =
      pickExistingSummary(
        weeklySummaries,
        involved.weekNumbers,
        (summary, period) =>
          summary.weekNumber === period.weekNumber && summary.year === period.year,
      ) ??
      weeklySummaries.find(
        (weeklySummary) =>
          weeklySummary.employeeId === employeeId &&
          weeklySummary.weekNumber === currentWeekNumber &&
          weeklySummary.year === currentWeekYear
      );
    const existingBiweeklySummary =
      pickExistingSummary(
        biweeklySummaries,
        involved.biweekNumbers,
        (summary, period) =>
          summary.biweekNumber === period.biweekNumber && summary.year === period.year,
      ) ??
      biweeklySummaries.find(
        (biweeklySummary) =>
          biweeklySummary.employeeId === employeeId &&
          biweeklySummary.biweekNumber === currentBiweekNumber &&
          biweeklySummary.year === currentYear
      );
    const existingMonthlySummary =
      pickExistingSummary(
        monthlySummaries,
        involved.months,
        (summary, period) => summary.month === period.month && summary.year === period.year,
      ) ??
      monthlySummaries.find(
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
        Empleado: formatEmployeeName(employee, nameFormat),
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

  // Export handler — siempre incluye las columnas de totales y horas extra.
  // Se guarda en un ref para que exportOptions (memoizado solo por permisos)
  // siempre invoque la versión actual con los datos frescos del último render.
  const handleExport = async (format: "excel" | "pdf") => {
    try {
      const headers = getExportHeaders(currentWeek, true);
      const data = getExportData(
        filteredEmployees,
        currentWeek,
        true,
        headers.slice(1, -2)
      );
      const groupedHeaders = getGroupedHeaders(currentWeek, true);
      const banner = groupedHeaders?.[0]?.[0] ?? "";
      const fileName = `Roles_${exportFileFormattedDate(new Date())}`;
      // Iconos vectoriales (Lucide) en el header de la tabla (Empleado,
      // Total horas, Horas extra) + leyenda explicativa debajo de la tabla.
      const headerIcons: Record<number, PdfHeaderIcon> = {
        0: { path: ICON_PERSON },
        [headers.length - 2]: { path: ICON_CLOCK },
        [headers.length - 1]: { path: ICON_CLOCK_PLUS },
      };
      const legend: PdfLegendEntry[] = [
        {
          icon: ICON_PERSON,
          label: "Empleado",
          description: "Nombre del empleado asignado.",
        },
        {
          icon: ICON_CLOCK,
          label: "Total horas",
          description: "Suma de horas trabajadas en la semana.",
        },
        {
          icon: ICON_CLOCK_PLUS,
          label: "Horas extra",
          description: "Horas adicionales fuera del horario regular.",
        },
      ];
      await exportTable({
        data,
        fileName,
        format,
        customHeaders: headers,
        groupedHeaders,
        title: "Reporte de Horas",
        subtitle: banner
          ? `Semana ${currentWeekNumber} · ${banner}`
          : undefined,
        headerIcons: format === "pdf" ? headerIcons : undefined,
        legend: format === "pdf" ? legend : undefined,
      });
    } catch (error) {
      showNotification("Error al exportar los datos", {
        severity: "error",
        duration: 5000,
      });
    }
  };

  const handleExportRef = useRef(handleExport);
  useEffect(() => {
    handleExportRef.current = handleExport;
  });

  const exportOptions = useMemo(() => {
    const options = [];
    if (userPermissions.includes(PERMISSION_CODES.EXPORT_ROLES)) {
      options.push({
        label: "Exportar a Excel",
        icon: <ExcelIcon size={20} />,
        onClick: () => handleExportRef.current("excel"),
      });
    }
    if (userPermissions.includes(PERMISSION_CODES.EXPORT_ROLES)) {
      options.push({
        label: "Exportar a PDF",
        icon: <PdfIcon size={20} />,
        onClick: () => handleExportRef.current("pdf"),
      });
    }
    return options;
  }, [userPermissions]);

  const canExport = userPermissions.includes(PERMISSION_CODES.EXPORT_ROLES);
  const hasExportableRows =
    viewMode === "employee" ? filteredEmployees.length > 0 : filteredSchedules.length > 0;

  return (
    <PageContainer>
      <PageCard>
        <PageHeader
          icon={<NavIcon label={APPBAR_MENU.ROLES} />}
          title={PAGE_TITLE.ROLES}
          mobileTitle={PAGE_TITLE.ROLES_SIMPLIFIED}
          subtitle={
            viewMode === "employee"
              ? `${filteredEmployees.length} empleados`
              : `${filteredSchedules.length} horarios`
          }
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <SegmentedToggle
                size="small"
                ariaLabel="Nombre a mostrar en el tablero"
                options={[
                  { value: "full", label: "Nombre completo" },
                  { value: "preferred", label: "Nombre preferido" },
                ]}
                value={nameFormat}
                onChange={(value) => handleNameFormat(value as EmployeeNameFormat)}
              />
              {canExport ? (
                <ExportMenu actions={exportOptions} disabled={!hasExportableRows} />
              ) : undefined}
            </Box>
          }
          toolbar={
            <>
              <Box sx={{ flex: 1, maxWidth: { sm: 280 }, minWidth: { xs: "100%", sm: 180 } }}>
                <SearchBarComponent
                  placeholder="Buscar empleado u horario…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />
              </Box>
              {/* El toggle de calendario va justo a la derecha del buscador: el
                  board queda libre de barras internas y usa todo su alto. */}
              <Box sx={{ flexShrink: 0 }}>
                <SegmentedToggle
                  size="medium"
                  ariaLabel="Cambiar la vista del calendario"
                  fullWidth={isSmallScreen}
                  options={[
                    {
                      value: "employee",
                      label: isSmallScreen ? "Individual" : "Calendario Individual",
                      icon: <IconUsers size={14} />,
                    },
                    {
                      value: "schedule",
                      label: isSmallScreen ? "Por Horario" : "Calendario por Horario",
                      icon: <IconTimeline size={14} />,
                    },
                  ]}
                  value={viewMode}
                  onChange={setViewMode}
                />
              </Box>
            </>
          }
          toolbarEnd={
            <DateNavigator
              value={firstDayOfWeek}
              maxDate={nextWeekEnd}
              onChange={handleDateChange}
              onPrevious={handlePreviousWeek}
              onNext={handleNextWeek}
              onReset={handleCurrentWeek}
              disableNext={
                !isValidDateForSelect(new Date(getCurrentWeekDates(weekOffset + 1)[0].isoDate))
              }
              disableReset={weekOffset === 0}
              labels={{
                previous: MANAGEMENT.TOOLTIP_PREV_WEEK,
                next: MANAGEMENT.TOOLTIP_NEXT_WEEK,
                reset: MANAGEMENT.TOOLTIP_CURRENT_WEEK,
              }}
            />
          }
        />

        {/* The board needs a definite height: on phones it takes the viewport
            (scroll the page to reach it), on desktop it fills the card. */}
        <PageBody sx={{ height: { xs: "calc(100dvh - 88px)", md: "auto" }, minHeight: { xs: 480, md: 0 } }}>
          {isLoading ? (
            <LoadingState label="Cargando roles…" />
          ) : !userPermissions.includes(PERMISSION_CODES.VIEW_ROLES) ? (
            <EmptyState icon={<IconLockAccess />} title="No tienes permisos para ver roles" />
          ) : (
            <NameFormatProvider value={nameFormat}>
            <WeeklyBoard
              filteredEmployees={filteredEmployees}
              schedules={viewMode === "schedule" ? filteredSchedules : schedules}
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
              permissions={userPermissions}
              viewMode={viewMode}
            />
            </NameFormatProvider>
          )}
        </PageBody>
      </PageCard>

    </PageContainer>
  );
};

export default RolesPage;
