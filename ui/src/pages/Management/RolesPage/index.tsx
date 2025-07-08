import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { Employee } from "../../../models/Employee";
import { HoursWorked } from "../../../models/HoursWorked";
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
  differenceInCalendarWeeks,
  endOfWeek,
  startOfWeek,
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
} from "@mui/material";
import {
  exportToExcel,
  exportToPDF,
  handleExportTableData,
} from "../../../utils/export";
import {
  getBiweekNumber,
  getCurrentWeekDates,
  getDayName,
  getFirstDayOfWeek,
  getMonthNumber,
  getWeekNumber,
  isValidDateForSelect,
} from "../../../utils/dates";
import PAGE_TITLE from "../../../constants/pageTitle.constants";
import PERMISSIONS from "../../../constants/permissions.constants";
import MANAGEMENT from "../../../constants/management.constants";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import DialogComponent from "../../../components/Dialog/Dialog.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {
  rolesHeaderBoxStyles,
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
import { useTablePreferences } from '../../../hooks/useTablePreferences';
import { getPreferencesObject, setPreferencesObject } from '../../../utils/persistentState';

const preferencesKey = 'roles-preferences';
const defaultPreferences = { date: new Date().toISOString() };

// Roles management and summary page component
const RolesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
  const { employees, isLoadingEmployees } = useSelector(
    (state: RootState) => state.employees,
  );
  const { schedules, isLoadingSchedules } = useSelector(
    (state: RootState) => state.schedules,
  );
  const { hoursWorked, isLoadingHoursWorked } = useSelector(
    (state: RootState) => state.hoursWorked,
  );
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
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
    createOrUpdateBiweeklySummary,
  } = useBiweeklySummaries();
  const {
    monthlySummaries,
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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const getInitialRowsPerPage = () => {
    if (typeof window !== 'undefined') {
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

  const { search, setSearch, rowsPerPage, setRowsPerPage } = useTablePreferences('roles-selector', getInitialRowsPerPage);

  // Fetch employees, schedules, and hours worked on mount
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchSchedules());
    dispatch(fetchHoursWorked());
  }, [dispatch, location.pathname]);

  const isLoading =
    isLoadingEmployees ||
    isLoadingSchedules ||
    isLoadingHoursWorked ||
    isLoadingWeeklySummaries ||
    isLoadingBiweeklySummaries ||
    isLoadingMonthlySummaries;

  // Filter employees by search input
  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredEmployees(
      employees.filter((employee) =>
        normalizeString(`${employee.firstName} ${employee.lastName}`)
          .toLowerCase()
          .includes(normalizeString(search).toLowerCase()),
      ),
    );
  }, [search, employees]);

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
      setPreferencesObject(preferencesKey, { ...prefs, date: newDate.toISOString() });
      const today = new Date();
      const weekOptions: { weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {
        weekStartsOn: 1,
      };
      const newWeekOffset = differenceInCalendarWeeks(
        newDate,
        today,
        weekOptions,
      );
      setWeekOffset(newWeekOffset);
    }
  }, []);

  const handleCreateOrUpdateHoursAndSummaries = useCallback(
    async (
      employeeId: number,
      date: string,
      scheduleId: number,
      weekNumber: number,
      biweekNumber: number,
      month: number,
      year: number,
      totalHours: number,
    ) => {
      const existingHoursRecord = hoursWorked.find(
        (hours) =>
          hours.employeeId === employeeId &&
          new Date(hours.date).getTime() === new Date(date).getTime(),
      );

      let previousHours: number | undefined;
      let createOrUpdatedHoursWorked: Omit<HoursWorked, "id"> | HoursWorked;

      if (existingHoursRecord) {
        createOrUpdatedHoursWorked = {
          ...existingHoursRecord,
          scheduleId,
        };
        previousHours = schedules.find(
          (schedule) => schedule.id === existingHoursRecord.scheduleId,
        )?.hours;
      } else {
        createOrUpdatedHoursWorked = {
          employeeId,
          date,
          scheduleId,
        };
      }

      const existingWeeklySummaryRecord = weeklySummaries.find(
        (weeklySummary) =>
          weeklySummary.employeeId === employeeId &&
          weeklySummary.weekNumber === weekNumber &&
          weeklySummary.year === year,
      );

      let createOrUpdatedWeeklySummary:
        | Omit<WeeklySummary, "id">
        | WeeklySummary;

      if (existingWeeklySummaryRecord) {
        createOrUpdatedWeeklySummary = {
          ...existingWeeklySummaryRecord,
          totalHours: previousHours
            ? existingWeeklySummaryRecord.totalHours +
              totalHours -
              previousHours
            : existingWeeklySummaryRecord.totalHours + totalHours,
        };
      } else {
        createOrUpdatedWeeklySummary = {
          employeeId,
          weekNumber,
          month,
          year,
          totalHours,
        };
      }

      const existingBiweeklySummaryRecord = biweeklySummaries.find(
        (biweeklySummary) =>
          biweeklySummary.employeeId === employeeId &&
          biweeklySummary.biweekNumber === biweekNumber &&
          biweeklySummary.year === year,
      );

      let createOrUpdatedBiweeklySummary:
        | Omit<BiweeklySummary, "id">
        | BiweeklySummary;

      if (existingBiweeklySummaryRecord) {
        createOrUpdatedBiweeklySummary = {
          ...existingBiweeklySummaryRecord,
          totalHours: previousHours
            ? existingBiweeklySummaryRecord.totalHours +
              totalHours -
              previousHours
            : existingBiweeklySummaryRecord.totalHours + totalHours,
        };
      } else {
        createOrUpdatedBiweeklySummary = {
          employeeId,
          biweekNumber,
          month,
          year,
          totalHours,
        };
      }

      const existingMonthlySummaryRecord = monthlySummaries.find(
        (monthlySummary) =>
          monthlySummary.employeeId === employeeId &&
          monthlySummary.month === month &&
          monthlySummary.year === year,
      );

      let createOrUpdatedMonthlySummary:
        | Omit<MonthlySummary, "id">
        | MonthlySummary;

      if (existingMonthlySummaryRecord) {
        createOrUpdatedMonthlySummary = {
          ...existingMonthlySummaryRecord,
          totalHours: previousHours
            ? existingMonthlySummaryRecord.totalHours +
              totalHours -
              previousHours
            : existingMonthlySummaryRecord.totalHours + totalHours,
        };
      } else {
        createOrUpdatedMonthlySummary = {
          employeeId,
          month,
          year,
          totalHours,
        };
      }
      await Promise.all([
        dispatch(createOrUpdateHoursWorked(createOrUpdatedHoursWorked)),
        createOrUpdateWeeklySummary(createOrUpdatedWeeklySummary),
        createOrUpdateBiweeklySummary(createOrUpdatedBiweeklySummary),
        createOrUpdateMonthlySummary(createOrUpdatedMonthlySummary),
      ]);
    },
    [
      dispatch,
      hoursWorked,
      schedules,
      weeklySummaries,
      biweeklySummaries,
      monthlySummaries,
      createOrUpdateWeeklySummary,
      createOrUpdateBiweeklySummary,
      createOrUpdateMonthlySummary,
    ],
  );

  const handleChange = (
    event: SelectChangeEvent<string>,
    employeeId: number,
    date: Date,
  ) => {
    if (event.target.value === "Other") {
      return;
    }

    const selectedSchedule = schedules.find(
      (schedule) =>
        schedule.label === event.target.value &&
        schedule.days.includes(getDayName(date)),
    );

    if (!selectedSchedule) {
      return;
    }

    handleCreateOrUpdateHoursAndSummaries(
      employeeId,
      date.toISOString(),
      selectedSchedule.id,
      getWeekNumber(date),
      getBiweekNumber(date),
      date.getMonth() + 1,
      date.getFullYear(),
      selectedSchedule.hours,
    );
  };

  const handleAdjustTime = async (
    employeeId: number,
    condition: 'add' | 'subtract',
    timeAdjustment: number,
  ) => {
    if (!timeAdjustment || timeAdjustment < 0) return;

    const adjustment = condition === "add" ? timeAdjustment : -timeAdjustment;

    const existingWeeklySummary = weeklySummaries.find(
      (weeklySummary) =>
        weeklySummary.employeeId === employeeId &&
        weeklySummary.weekNumber === currentWeekNumber &&
        weeklySummary.month === currentMonth &&
        weeklySummary.year === currentYear,
    );
    const existingBiweeklySummary = biweeklySummaries.find(
      (biweeklySummary) =>
        biweeklySummary.employeeId === employeeId &&
        biweeklySummary.biweekNumber === currentBiweekNumber &&
        biweeklySummary.month === currentMonth &&
        biweeklySummary.year === currentYear,
    );
    const existingMonthlySummary = monthlySummaries.find(
      (monthlySummary) =>
        monthlySummary.employeeId === employeeId &&
        monthlySummary.month === currentMonth &&
        monthlySummary.year === currentYear,
    );

    const updatedWeeklySummary: WeeklySummary = {
      id: existingWeeklySummary?.id ?? 0,
      employeeId: existingWeeklySummary?.employeeId ?? employeeId,
      weekNumber: existingWeeklySummary?.weekNumber ?? currentWeekNumber,
      month: existingWeeklySummary?.month ?? currentMonth,
      year: existingWeeklySummary?.year ?? currentYear,
      totalHours: Math.max(0, (existingWeeklySummary?.totalHours ?? 0) + adjustment),
    };

    const updatedBiweeklySummary: BiweeklySummary = {
      id: existingBiweeklySummary?.id ?? 0,
      employeeId: existingBiweeklySummary?.employeeId ?? employeeId,
      biweekNumber:
        existingBiweeklySummary?.biweekNumber ?? currentBiweekNumber,
      month: existingBiweeklySummary?.month ?? currentMonth,
      year: existingBiweeklySummary?.year ?? currentYear,
      totalHours: Math.max(0, (existingBiweeklySummary?.totalHours ?? 0) + adjustment),
    };

    const updatedMonthlySummary: MonthlySummary = {
      id: existingMonthlySummary?.id ?? 0,
      employeeId: existingMonthlySummary?.employeeId ?? employeeId,
      month: existingMonthlySummary?.month ?? currentMonth,
      year: existingMonthlySummary?.year ?? currentYear,
      totalHours: Math.max(0, (existingMonthlySummary?.totalHours ?? 0) + adjustment),
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

  const handleCloseExportDialog = () => {
    setOpenExportDialog(false);
  };

  const handleExportHours = async (shouldExportHours: boolean) => {
    setIsExporting(true);
    try {
      const { dataForExport, fileName } = handleExportTableData(
        filteredEmployees,
        hoursWorked,
        schedules,
        weeklySummaries,
        biweeklySummaries,
        monthlySummaries,
        currentWeekNumber,
        currentBiweekNumber,
        currentMonth,
        currentYear,
        getCurrentWeekDates(weekOffset),
        shouldExportHours,
      );

      if (exportType === "excel") {
        await exportToExcel(dataForExport, fileName);
      } else if (exportType === "pdf") {
        await exportToPDF(dataForExport, fileName);
      }

      setOpenExportDialog(false);
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
        icon: <FontAwesomeIcon icon={faFileExcel} size="lg" />,
        onClick: () => handleOpenExportDialog("excel"),
      });
    }
    if (userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES)) {
      options.push({
        label: "Exportar a PDF",
        icon: <FontAwesomeIcon icon={faFilePdf} size="lg" />,
        onClick: () => handleOpenExportDialog("pdf"),
      });
    }
    return options;
  }, [userPermissions]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={rolesHeaderBoxStyles}
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
        {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES) &&
          userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES) && (
            <Box sx={exportSpeedDialBoxStyles}>
              {filteredEmployees.length > 0 && (
                <SpeedDialComponent
                  actions={exportOptions}
                  mainIcon={<DownloadRoundedIcon />}
                  openIcon={<CloseRoundedIcon />}
                  direction="left"
                />
              )}
            </Box>
          )}
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
              {filteredEmployees && (
                <SearchBarComponent
                  placeholder={MANAGEMENT.ROLES_PAGE.SEARCH_PLACEHOLDER}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
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
                                getCurrentWeekDates(weekOffset + 1)[0].isoDate,
                              ),
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
          {filteredEmployees.length > 0 ? (
            <SelectorTableComponent
              key={`schedules-${schedules.length}-${schedules.map(s => s.id).join('-')}`}
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
              permissions={userPermissions}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
            />
          ) : (
            <Box sx={noEmployeesBoxStyles}>
              <ManageSearchIcon color="disabled" sx={noEmployeesIconStyles} />
              <Typography variant="h6" color="textSecondary">
                {MANAGEMENT.NO_EMPLOYEES}
              </Typography>
            </Box>
          )}
        </>
      )}
      <DialogComponent
        open={openExportDialog}
        onClose={handleCloseExportDialog}
        onConfirm={() => handleExportHours(true)}
        title={MANAGEMENT.DIALOG_EXPORT_TITLE}
        message={
          exportType === "excel"
            ? MANAGEMENT.DIALOG_EXPORT_MESSAGE_EXCEL
            : MANAGEMENT.DIALOG_EXPORT_MESSAGE_PDF
        }
        type="info"
        confirmText={MANAGEMENT.DIALOG_EXPORT_CONFIRM}
        cancelText={MANAGEMENT.DIALOG_EXPORT_CANCEL}
        loading={isExporting}
      />
    </Box>
  );
};

export default RolesPage;
