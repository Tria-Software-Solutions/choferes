import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Employee } from "../../models/Employee";
import { HoursWorked } from "../../models/HoursWorked";
import { WeeklySummary } from "../../models/WeeklySummary";
import { BiweeklySummary } from "../../models/BiweeklySummary";
import { MonthlySummary } from "../../models/MonthlySummary";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchEmployees } from "../../store/slices/employeeSlice";
import { fetchSchedules } from "../../store/slices/schedulesSlice";
import {
  fetchHoursWorked,
  createOrUpdateHoursWorked,
} from "../../store/slices/hoursWorkedSlice";
import { useWeeklySummaries } from "../../hooks/useWeeklySummary";
import { useBiweeklySummaries } from "../../hooks/useBiweeklySummary";
import { useMonthlySummaries } from "../../hooks/useMonthlySummary";
import SearchBarComponent from "../../components/SearchBar/SearchBar.component";
import SelectorTableComponent from "../../components/Table/SelectorTable/SelectorTable.component";
import SpeedDialComponent from "../../components/SpeedDial/SpeedDial.component";
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
  Avatar,
  IconButton,
  Dialog,
  ButtonGroup,
  Divider,
} from "@mui/material";
import {
  exportToExcel,
  exportToPDF,
  handleExportTableData,
} from "../../utils/export";
import {
  getBiweekNumber,
  getCurrentWeekDates,
  getDayName,
  getFirstDayOfWeek,
  getMonthNumber,
  getWeekNumber,
  isValidDateForSelect,
} from "../../utils/dates";
import PAGE_TITLE from "../../constants/pageTitle.constants";
import PERMISSIONS from "../../constants/permissions.constants";
import MANAGEMENT from "../../constants/management.constants";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import DialogComponent from "../../components/Dialog/Dialog.component";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import BarChartIcon from "@mui/icons-material/BarChart";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Tab from "@mui/material/Tab";
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
  summaryDialogPaperSx,
  summaryDialogHeaderBoxStyles,
  summaryDialogCloseIconStyles,
  summaryTabPanelAvatarStyles,
  summaryInfoBoxStyles,
  summaryInfoIconBoxStyles,
  summaryInfoIconStyles,
  summaryInfoTitleStyles,
  summaryInfoDescStyles,
} from "./RolesPage.styles";

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
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<Date | null>(new Date());
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number>(0);
  const [currentBiweekNumber, setCurrentBiweekNumber] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [filter, setFilter] = useState("");
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");
  const [isExporting, setIsExporting] = useState(false);
  const [openSummaryDialogEmployee, setOpenSummaryDialogEmployee] =
    useState<Employee | null>(null);
  const [summaryTab, setSummaryTab] = useState<
    "weekly" | "biweekly" | "monthly" | "overtime"
  >("weekly");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch employees, schedules, and hours worked on mount
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchSchedules());
    dispatch(fetchHoursWorked());
  }, [dispatch]);

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
          .includes(normalizeString(filter).toLowerCase()),
      ),
    );
  }, [filter, employees]);

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

  // Handle search bar input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  // Handle date picker change and update week offset
  const handleDateChange = useCallback((newDate: Date | null) => {
    if (newDate) {
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
    setFirstDayOfWeek(newDate);
  }, []);

  const handleCreateOrUpdateHoursAndSummaries = useCallback(
    async (
      employeeId: number,
      date: Date,
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
      date,
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
    condition: string,
    timeAdjustment: number,
  ) => {
    if (!timeAdjustment) return;

    const adjustment = condition === "sum" ? timeAdjustment : -timeAdjustment;

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
      totalHours: (existingWeeklySummary?.totalHours ?? 0) + adjustment,
    };

    const updatedBiweeklySummary: BiweeklySummary = {
      id: existingBiweeklySummary?.id ?? 0,
      employeeId: existingBiweeklySummary?.employeeId ?? employeeId,
      biweekNumber:
        existingBiweeklySummary?.biweekNumber ?? currentBiweekNumber,
      month: existingBiweeklySummary?.month ?? currentMonth,
      year: existingBiweeklySummary?.year ?? currentYear,
      totalHours: (existingBiweeklySummary?.totalHours ?? 0) + adjustment,
    };

    const updatedMonthlySummary: MonthlySummary = {
      id: existingMonthlySummary?.id ?? 0,
      employeeId: existingMonthlySummary?.employeeId ?? employeeId,
      month: existingMonthlySummary?.month ?? currentMonth,
      year: existingMonthlySummary?.year ?? currentYear,
      totalHours: (existingMonthlySummary?.totalHours ?? 0) + adjustment,
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

  const getEmployeeWeeklyHours = (employeeId: number) => {
    const summary = weeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.weekNumber === currentWeekNumber &&
        s.year === currentYear,
    );
    return summary ? summary.totalHours : 0;
  };

  const getEmployeeBiweeklyHours = (employeeId: number) => {
    const summary = biweeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.biweekNumber === currentBiweekNumber &&
        s.year === currentYear,
    );
    return summary ? summary.totalHours : 0;
  };

  const getEmployeeMonthlyHours = (employeeId: number) => {
    const summary = monthlySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.month === currentMonth &&
        s.year === currentYear,
    );
    return summary ? summary.totalHours : 0;
  };

  const getEmployeeOvertime = (employeeId: number) => {
    const weekly = getEmployeeWeeklyHours(employeeId);
    return weekly > 48 ? weekly - 48 : 0;
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={rolesHeaderBoxStyles}
      >
        <Box display="flex" flexDirection="column" alignItems="flex-start" sx={rolesTitleBoxStyles}>
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            sx={rolesTitleStyles}
          >
            <AssignmentIcon fontSize={isSmallScreen ? "small" : "large"} sx={rolesIconStyles(theme)} />
            {PAGE_TITLE.ROLES}
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
        <Box
          sx={loadingBoxStyles}
        >
          <Backdrop
            sx={backdropStyles(theme)}
            open={isLoading}
          >
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
                  placeholder={MANAGEMENT.SEARCH_PLACEHOLDER}
                  value={filter}
                  onChange={handleFilterChange}
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
                <Box display="flex" alignItems="center" justifyContent="flex-start" gap={1}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker
                      label={MANAGEMENT.DATE_PICKER_LABEL}
                      value={firstDayOfWeek || null}
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
                  <ButtonGroup
                    variant="contained"
                    sx={buttonGroupSx}
                  >
                    <Tooltip title={MANAGEMENT.TOOLTIP_PREV_WEEK} arrow>
                      <Button onClick={handlePreviousWeek}>
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={MANAGEMENT.TOOLTIP_NEXT_WEEK} arrow>
                      <Button disabled={!isValidDateForSelect(new Date(getCurrentWeekDates(weekOffset + 1)[0].isoDate))} onClick={handleNextWeek}>
                        <ArrowForwardIosRoundedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={MANAGEMENT.TOOLTIP_CURRENT_WEEK} arrow>
                      <Button disabled={weekOffset === 0} onClick={handleCurrentWeek}>
                        <CalendarTodayRoundedIcon />
                      </Button>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredEmployees.length > 0 ? (
            <SelectorTableComponent
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
              onInfoClick={setOpenSummaryDialogEmployee}
            />
          ) : (
            <Box
              sx={noEmployeesBoxStyles}
            >
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
        message={exportType === "excel" ? MANAGEMENT.DIALOG_EXPORT_MESSAGE_EXCEL : MANAGEMENT.DIALOG_EXPORT_MESSAGE_PDF}
        type="info"
        confirmText={MANAGEMENT.DIALOG_EXPORT_CONFIRM}
        cancelText={MANAGEMENT.DIALOG_EXPORT_CANCEL}
        loading={isExporting}
      />
      {openSummaryDialogEmployee && (
        <Dialog
          open={!!openSummaryDialogEmployee}
          onClose={() => setOpenSummaryDialogEmployee(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: summaryDialogPaperSx,
          }}
        >
          <Box
            sx={summaryDialogHeaderBoxStyles}
          >
            <Box>
              <Typography variant="h5" fontWeight={700} color="#fff">
                {MANAGEMENT.SUMMARY_TITLE}
              </Typography>
              <Typography variant="subtitle2" color="#fff">
                {openSummaryDialogEmployee.firstName}{" "}
                {openSummaryDialogEmployee.lastName}
              </Typography>
            </Box>
            <Box flexGrow={1} />
            <IconButton
              onClick={() => setOpenSummaryDialogEmployee(null)}
              sx={summaryDialogCloseIconStyles}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TabContext value={summaryTab}>
                  <TabList
                    onChange={(_, v) => setSummaryTab(v)}
                    variant="fullWidth"
                  >
                    <Tab label={MANAGEMENT.TAB_WEEKLY} value="weekly" />
                    <Tab label={MANAGEMENT.TAB_BIWEEKLY} value="biweekly" />
                    <Tab label={MANAGEMENT.TAB_MONTHLY} value="monthly" />
                    <Tab label={MANAGEMENT.TAB_OVERTIME} value="overtime" />
                  </TabList>
                  <Divider sx={{ mb: 2 }} />
                  <TabPanel value="weekly">
                    <Box display="flex" alignItems="center" gap={3}>
                      <Avatar
                        sx={summaryTabPanelAvatarStyles(theme, "success")}
                      >
                        <BarChartIcon color="success" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {MANAGEMENT.SUMMARY_WEEKLY}
                        </Typography>
                        <Typography
                          variant="h3"
                          color="primary"
                          fontWeight={800}
                        >
                          {getEmployeeWeeklyHours(openSummaryDialogEmployee.id)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Semana #{currentWeekNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TabPanel>
                  <TabPanel value="biweekly">
                    <Box display="flex" alignItems="center" gap={3}>
                      <Avatar
                        sx={summaryTabPanelAvatarStyles(theme, "info")}
                      >
                        <BarChartIcon color="info" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {MANAGEMENT.SUMMARY_BIWEEKLY}
                        </Typography>
                        <Typography
                          variant="h3"
                          color="primary"
                          fontWeight={800}
                        >
                          {getEmployeeBiweeklyHours(
                            openSummaryDialogEmployee.id,
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quincena #{currentBiweekNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TabPanel>
                  <TabPanel value="monthly">
                    <Box display="flex" alignItems="center" gap={3}>
                      <Avatar
                        sx={summaryTabPanelAvatarStyles(theme, "warning")}
                      >
                        <BarChartIcon color="warning" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {MANAGEMENT.SUMMARY_MONTHLY}
                        </Typography>
                        <Typography
                          variant="h3"
                          color="primary"
                          fontWeight={800}
                        >
                          {getEmployeeMonthlyHours(
                            openSummaryDialogEmployee.id,
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mes #{currentMonth} / {currentYear}
                        </Typography>
                      </Box>
                    </Box>
                  </TabPanel>
                  <TabPanel value="overtime">
                    <Box display="flex" alignItems="center" gap={3}>
                      <Avatar
                        sx={summaryTabPanelAvatarStyles(theme, "error")}
                      >
                        <AccessTimeRoundedIcon color="error" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {MANAGEMENT.SUMMARY_OVERTIME}
                        </Typography>
                        <Typography variant="h3" color="error" fontWeight={800}>
                          {getEmployeeOvertime(openSummaryDialogEmployee.id)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {MANAGEMENT.SUMMARY_DETAIL_OVERTIME}
                        </Typography>
                      </Box>
                    </Box>
                  </TabPanel>
                </TabContext>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={summaryInfoBoxStyles(theme)}
                >
                  <Box
                    sx={summaryInfoIconBoxStyles(theme)}
                  >
                    <InfoOutlinedIcon
                      sx={summaryInfoIconStyles(theme)}
                    />
                  </Box>
                  <Box>
                    <Box sx={summaryInfoTitleStyles(theme)}>
                      {MANAGEMENT.SUMMARY_INFO_TITLE}
                    </Box>
                    <Box sx={summaryInfoDescStyles(theme)}>
                      {MANAGEMENT.SUMMARY_INFO_DESC}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default RolesPage;
