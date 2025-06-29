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
import SearchBar from "../../components/SearchBar/SearchBar";
import SelectorTable from "../../components/Table/SelectorTable/SelectorTable";
import CustomSpeedDial from "../../components/SpeedDial/CustomSpeedDial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
} from "@mui/material";
import {
  createExportOptions,
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
import { PAGE_TITLE, PERMISSIONS } from "../../constants/constants";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import ConfirmationDialog from "../../components/Dialog/ConfirmationDialog";

const RolesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userPermissions } = useAuthContext();
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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  useEffect(() => {
    const normalizeString = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    setFilteredEmployees(
      employees.filter((employee) =>
        normalizeString(`${employee.firstName} ${employee.lastName}`)
          .toLowerCase()
          .includes(normalizeString(filter).toLowerCase())
      )
    );
  }, [filter, employees]);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleDateChange = useCallback((newDate: Date | null) => {
    if (newDate) {
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
      totalHours: number
    ) => {
      const existingHoursRecord = hoursWorked.find(
        (hours) =>
          hours.employeeId === employeeId &&
          new Date(hours.date).getTime() === new Date(date).getTime()
      );

      let previousHours: number | undefined;
      let createOrUpdatedHoursWorked: Omit<HoursWorked, "id"> | HoursWorked;

      if (existingHoursRecord) {
        createOrUpdatedHoursWorked = {
          ...existingHoursRecord,
          scheduleId,
        };
        previousHours = schedules.find(
          (schedule) => schedule.id === existingHoursRecord.scheduleId
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
          weeklySummary.year === year
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
          biweeklySummary.year === year
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
          monthlySummary.year === year
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
    ]
  );

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
      console.error("No schedule found for the selected label");
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
      selectedSchedule.hours
    );
  };

  const handleAdjustTime = async (
    employeeId: number,
    condition: string,
    timeAdjustment: number
  ) => {
    if (!timeAdjustment) return;

    const adjustment = condition === "sum" ? timeAdjustment : -timeAdjustment;

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
        shouldExportHours
      );
      
      if (exportType === "excel") {
        await exportToExcel(dataForExport, fileName);
      } else if (exportType === "pdf") {
        await exportToPDF(dataForExport, fileName);
      }
      
      setOpenExportDialog(false);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = useMemo(() => {
    const excelOption = userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES)
      ? () => handleOpenExportDialog("excel")
      : undefined;

    const pdfOption = userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES)
      ? () => handleOpenExportDialog("pdf")
      : undefined;

    return createExportOptions(
      <FontAwesomeIcon icon={faFileExcel} size="lg" />,
      <FontAwesomeIcon icon={faFilePdf} size="lg" />,
      excelOption,
      pdfOption,
    );
  }, [userPermissions]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box display="flex" alignItems="center">
          <CalendarMonthRoundedIcon
            fontSize={isSmallScreen ? "small" : "large"}
          />
          <Box sx={{ ml: 1 }}>
            <Typography
              variant={isSmallScreen ? "h5" : "h4"}
              sx={{ flexGrow: 1 }}
            >
              {isSmallScreen ? PAGE_TITLE.ROLES_SIMPLIFIED : PAGE_TITLE.ROLES}
            </Typography>
          </Box>
        </Box>
        {userPermissions.includes(PERMISSIONS.EXPORT_EXCEL_ROLES) &&
          userPermissions.includes(PERMISSIONS.EXPORT_PDF_ROLES) && (
            <Box sx={{ minHeight: 65 }}>
              {filteredEmployees.length > 0 && (
                <CustomSpeedDial
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
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingTop: "10%",
          }}
        >
          <Backdrop
            sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
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
                <SearchBar
                  placeholder="Buscar empleado"
                  value={filter}
                  onChange={handleFilterChange}
                  sx={{
                    maxWidth: "100%",
                  }}
                  fullWidth
                />
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "column", md: "row" }}
                alignItems="flex-start"
                justifyContent="flex-end"
                gap={2}
              >
                <Box
                  display="flex"
                  flexDirection={{ xs: "row", sm: "row", md: "row" }}
                  alignItems="center"
                  justifyContent="flex-end"
                  gap={2}
                  width="100%"
                >
                  <Tooltip title="Semana Anterior" arrow>
                    <Box>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          width: { xs: "auto", sm: "auto", md: "auto" },
                        }}
                        onClick={handlePreviousWeek}
                      >
                        <ArrowBackIosNewRoundedIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Semana Siguiente" arrow>
                    <Box>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          width: { xs: "auto", sm: "auto", md: "auto" },
                        }}
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
                    </Box>
                  </Tooltip>
                  <Tooltip title="Semana Actual" arrow>
                    <Box>
                      <Button
                        variant="contained"
                        sx={{
                          height: "56px",
                          width: { xs: "auto", sm: "auto", md: "auto" },
                        }}
                        disabled={weekOffset === 0}
                        onClick={handleCurrentWeek}
                      >
                        <CalendarTodayRoundedIcon />
                      </Button>
                    </Box>
                  </Tooltip>
                </Box>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    label="Seleccionar fecha"
                    value={firstDayOfWeek || null}
                    sx={{
                      width: { xs: "100%", sm: "100%", md: "auto" },
                      mt: { xs: 2, sm: 2, md: 0 },
                    }}
                    maxDate={nextWeekEnd}
                    views={["year", "month", "day"]}
                    slots={{
                      toolbar: () => null,
                    }}
                    slotProps={{
                      textField: {
                        inputProps: { readOnly: true },
                        onMouseDown: (e) => e.preventDefault(),
                      },
                      actionBar: {
                        actions: [],
                      },
                    }}
                    closeOnSelect
                    onChange={handleDateChange}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
          </Grid>
          <br />
          {filteredEmployees.length > 0 ? (
            <SelectorTable
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
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "10%",
                paddingBottom: "12%",
              }}
            >
              <ManageSearchIcon color="disabled" sx={{ fontSize: "65px" }} />
              <Typography variant="h6" color="textSecondary">
                No se encontraron empleados para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
      <ConfirmationDialog
        open={openExportDialog}
        onClose={handleCloseExportDialog}
        onConfirm={() => handleExportHours(true)}
        title="Exportar Horas"
        message={`¿Quieres que se incluyan las horas trabajadas al exportar el ${exportType}?`}
        type="info"
        confirmText="Sí, incluir horas"
        cancelText="No, solo datos básicos"
        loading={isExporting}
      />
    </Box>
  );
};

export default RolesPage;
