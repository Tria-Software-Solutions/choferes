import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";

import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
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
  Grid,
  Tooltip,
  Button,
  CircularProgress,
  SelectChangeEvent,
  Backdrop,
  ButtonGroup,
  Divider,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { exportFileFormattedDate, exportTable } from "../../../utils/export";
import {
  getBiweekNumber,
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
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloseIcon from "@mui/icons-material/Close";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoGenerateModal, { AutoGenerateConfig } from "../../../components/Modal/AutoGenerateModal/AutoGenerateModal.component";
import {
  rolesTitleBoxStyles,
  rolesTitleStyles,
  rolesIconStyles,
  rolesDividerStyles,
  exportSpeedDialBoxStyles,
  loadingBoxStyles,
  backdropStyles,
  searchBarSx,
  datePickerSx,
  buttonGroupSx,
  noEmployeesBoxStyles,
  noEmployeesIconStyles,
} from "./styles";
import { useLocation } from "react-router-dom";
import { useTablePreferences } from "../../../hooks/useTablePreferences";
import {
  getPreferencesObject,
  setPreferencesObject,
} from "../../../utils/persistentState";
import { useAppNotifications } from "../../../components/Snackbar/Snackbar.component";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
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
    updateBiweeklySummary,
  } = useBiweeklySummaries();
  const {
    monthlySummaries,
    isLoadingMonthlySummaries,
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
    return (savedViewMode === 'employee' || savedViewMode === 'schedule') 
      ? savedViewMode as 'employee' | 'schedule' 
      : 'employee';
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const getInitialRowsPerPage = () => {
    if (typeof window !== "undefined") {
      const maxHeight = window.innerHeight * 0.6;
      const headHeight = 56;
      const paginationHeight = 64;
      const extra = 24;
      const availableHeight = maxHeight - headHeight - paginationHeight - extra;
      const rowHeight = 48;
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
    // Calculate total weekly hours for this employee
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    
    // Get all HoursWorked entries for this employee in this week
    const employeeHoursWorked = hoursWorked.filter(hw => {
      const hwDate = new Date(hw.date);
      return hw.employeeId === employeeId && 
             hwDate >= weekStart && 
             hwDate <= weekEnd;
    });

    // Add the new entry to the calculation if provided
    const allEntries = newHoursWorkedEntry 
      ? [...employeeHoursWorked, newHoursWorkedEntry]
      : employeeHoursWorked;
    
    // Calculate total hours for the week
    let totalWeeklyHours = 0;
    allEntries.forEach(hw => {
      const schedule = schedules.find(s => s.id === hw.scheduleId);
      if (schedule) {
        totalWeeklyHours += schedule.hours;
      }
    });

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
  }, [hoursWorked, schedules, weeklySummaries, updateWeeklySummary, createOrUpdateWeeklySummary]);

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

    // Create/update HoursWorked entry
    const hoursWorkedEntry = {
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

    const updatedWeeklySummary: WeeklySummary = {
      id: existingWeeklySummary?.id ?? 0,
      employeeId: existingWeeklySummary?.employeeId ?? employeeId,
      weekNumber: existingWeeklySummary?.weekNumber ?? currentWeekNumber,
      month: existingWeeklySummary?.month ?? currentMonth,
      year: existingWeeklySummary?.year ?? currentYear,
      totalHours: Math.max(
        0,
        (existingWeeklySummary?.totalHours ?? 0) + adjustment
      ),
    };

    const updatedBiweeklySummary: BiweeklySummary = {
      id: existingBiweeklySummary?.id ?? 0,
      employeeId: existingBiweeklySummary?.employeeId ?? employeeId,
      biweekNumber:
        existingBiweeklySummary?.biweekNumber ?? currentBiweekNumber,
      month: existingBiweeklySummary?.month ?? currentMonth,
      year: existingBiweeklySummary?.year ?? currentYear,
      totalHours: Math.max(
        0,
        (existingBiweeklySummary?.totalHours ?? 0) + adjustment
      ),
    };

    const updatedMonthlySummary: MonthlySummary = {
      id: existingMonthlySummary?.id ?? 0,
      employeeId: existingMonthlySummary?.employeeId ?? employeeId,
      month: existingMonthlySummary?.month ?? currentMonth,
      year: existingMonthlySummary?.year ?? currentYear,
      totalHours: Math.max(
        0,
        (existingMonthlySummary?.totalHours ?? 0) + adjustment
      ),
    };

    await Promise.all([
      updateWeeklySummary(updatedWeeklySummary.id, updatedWeeklySummary),
      updateBiweeklySummary(updatedBiweeklySummary.id, updatedBiweeklySummary),
      updateMonthlySummary(updatedMonthlySummary.id, updatedMonthlySummary),
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

  const handleOpenAddRoleModal = () => {
    setOpenAddRoleModal(true);
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
        
        // Calculate total weekly hours for this employee
        let totalWeeklyHours = 0;
        const weekDays = [];
        
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
        
        // Create all HoursWorked entries first
        await Promise.all(
          weekDays.map(async (entry) => {
            await dispatch(createOrUpdateHoursWorked(entry));
          })
        );
        
        // Then create/update the weekly summary with the correct total
        if (totalWeeklyHours > 0) {
          const weekStartDate = startOfWeek(firstDayOfWeek || new Date(), { weekStartsOn: 1 });
          
          // Ensure totalWeeklyHours does not exceed the max limit
          const maxLimit = config.maxHoursPerWeek || 48;
          const finalTotalHours = Math.min(totalWeeklyHours, maxLimit);
          
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
      
      showNotification('Horas generadas exitosamente', {
        severity: "success",
        duration: 3000,
      });
      
      setOpenAddRoleModal(false);
    } catch (error) {
      showNotification('Error al generar las horas', {
        severity: "error",
        duration: 5000,
      });
    } finally {
      setIsGeneratingHours(false);
    }
  };

  const handleModalConfigChange = (config: AutoGenerateConfig) => {
    setCurrentModalConfig(config);
  };

  const handleGenerateFromDialog = () => {
    if (!currentModalConfig) {
      showNotification('Error: No hay configuración disponible', {
        severity: "error",
        duration: 3000,
      });
      return;
    }
    // Activate loading immediately for better UX
    setIsGeneratingHours(true);
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
        icon: <DescriptionIcon />,
        onClick: () => handleOpenExportDialog("excel"),
      });
    }
    if (userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES)) {
      options.push({
        label: "Exportar a PDF",
        icon: <PictureAsPdfIcon />,
        onClick: () => handleOpenExportDialog("pdf"),
      });
    }
    return options;
  }, [userPermissions]);

  return (
    <Box>
      <Box
        sx={{ py: 1, mb: 2 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            sx={rolesTitleBoxStyles}
          >
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={rolesTitleStyles}
            >
              <AssignmentIcon
                fontSize={isSmallScreen ? "small" : "large"}
                sx={rolesIconStyles(theme)}
              />
              {isSmallScreen ? PAGE_TITLE.ROLES_SIMPLIFIED : PAGE_TITLE.ROLES}
            </Typography>
            <Divider sx={rolesDividerStyles(theme)} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES) &&
              userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES) && (
                <Box sx={exportSpeedDialBoxStyles}>
                  {(viewMode === 'employee' ? filteredEmployees.length > 0 : filteredSchedules.length > 0) && (
                    <SpeedDialComponent
                      actions={exportOptions}
                      mainIcon={<DownloadRoundedIcon />}
                      openIcon={<CloseRoundedIcon />}
                      direction="left"
                    />
                  )}
                </Box>
              )}
            
            {/* Botón para generar horas automáticamente */}
            <Tooltip title="Generar horas automáticamente" arrow>
              <IconButton
                onClick={handleOpenAddRoleModal}
                sx={{
                  top: "-4px",
                  width: "62px",
                  height: "58px",
                  borderRadius: "8px",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.background.paper
                      : theme.palette.primary.main,
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.main
                      : theme.palette.primary.contrastText,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: theme.transitions.create(
                    ["background", "box-shadow", "transform"],
                    {
                      duration: theme.transitions.duration.short,
                    }
                  ),
                  fontSize: 40,
                  "&:hover": {
                    backgroundColor: "#333333",
                  },
                }}
              >
                <AutoAwesomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      {isLoading ? (
        <Box sx={loadingBoxStyles}>
          <Backdrop sx={backdropStyles(theme)} open={isLoading}>
            <CircularProgress />
          </Backdrop>
        </Box>
      ) : (
        <>
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={4}>
              {(viewMode === 'employee' ? filteredEmployees : filteredSchedules) && (
                <SearchBarComponent
                  placeholder={
                    viewMode === 'employee' 
                      ? MANAGEMENT.ROLES_PAGE.SEARCH_PLACEHOLDER 
                      : MANAGEMENT.SCHEDULES_PAGE.SEARCH_PLACEHOLDER
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={searchBarSx ?? {}}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems={{ xs: "stretch", sm: "stretch", md: "center" }}
                justifyContent="flex-end"
                gap={2}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  gap={1}
                >
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <DatePicker
                      label={MANAGEMENT.DATE_PICKER_LABEL}
                      value={firstDayOfWeek}
                      maxDate={nextWeekEnd}
                      views={["year", "month", "day"]}
                      slots={{ toolbar: () => null }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          variant: "outlined",
                          sx: datePickerSx,
                        },
                      }}
                      closeOnSelect
                      onChange={handleDateChange}
                    />
                  </LocalizationProvider>
                  <ButtonGroup variant="contained" sx={buttonGroupSx}>
                    <Tooltip title={MANAGEMENT.TOOLTIP_PREV_WEEK} arrow>
                      <Button onClick={handlePreviousWeek}>
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={MANAGEMENT.TOOLTIP_NEXT_WEEK} arrow>
                      <span>
                        <Button
                          disabled={
                            !isValidDateForSelect(
                              new Date(
                                getCurrentWeekDates(weekOffset + 1)[0].isoDate
                              )
                            )
                          }
                          onClick={handleNextWeek}
                        >
                          <ArrowForwardIosRoundedIcon />
                        </Button>
                      </span>
                    </Tooltip>
                    <Tooltip title={MANAGEMENT.TOOLTIP_CURRENT_WEEK} arrow>
                      <span>
                        <Button
                          disabled={weekOffset === 0}
                          onClick={handleCurrentWeek}
                        >
                          <CalendarTodayRoundedIcon />
                        </Button>
                      </span>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <br />
          {viewMode === 'employee' ? (
            filteredEmployees.length > 0 ? (
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
                <ManageSearchIcon color="disabled" sx={noEmployeesIconStyles} />
                <Typography variant="h6" color="textSecondary">
                  {MANAGEMENT.NO_EMPLOYEES}
                </Typography>
              </Box>
            )
          ) : (
            filteredSchedules.length > 0 ? (
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
                <ManageSearchIcon color="disabled" sx={noEmployeesIconStyles} />
                <Typography variant="h6" color="textSecondary">
                  {MANAGEMENT.NO_SCHEDULES}
                </Typography>
              </Box>
            )
          )}
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
            icon={<FileDownloadIcon color="warning" />}
          />
        </>
      )}
      
      <Dialog
        open={openAddRoleModal}
        onClose={handleCloseAddRoleModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            border: "2px solid #fff",
            borderRadius: 3,
            minHeight: "60vh",
            boxShadow: 3,
            bgcolor: "background.paper",
            minWidth: { xs: '98%', sm: '95%', md: '90%', lg: '85%', xl: '80%' },
            maxWidth: { xs: '98%', sm: 1400 },
            width: 'auto',
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
              <AutoAwesomeIcon sx={{
                color: (theme) => theme.palette.primary.main,
                fontSize: 24,
              }} />
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
            <CloseIcon />
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
            disabled={isGeneratingHours}
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
