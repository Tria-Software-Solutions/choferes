import React, { useCallback, useEffect, useState } from "react";
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
} from "@mui/material";
import SplitButton from "../components/SplitButton/SplitButton";
import {
  createExportOptions,
  exportFileFormattedDate,
  exportToExcel,
  exportToPDF,
} from "../utils/exportUtils";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import SearchBar from "../components/SearchBar/SearchBar";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import {
  getBiweekNumber,
  getCurrentWeekDates,
  getDayName,
  getFirstDayOfWeek,
  getMonthNumber,
  getWeekNumber,
  isValidDateForSelect,
} from "../utils/dateUtils";
import { PAGE_TITLE } from "../constants/constants";
import { useEmployees } from "../hooks/useEmployee";
import { useSchedules } from "../hooks/useSchedule";
import { useHours } from "../hooks/useHours";
import { Employee } from "../models/Employee";
import {
  addWeeks,
  differenceInCalendarWeeks,
  endOfWeek,
  startOfWeek,
} from "date-fns";
import SelectorTable from "../components/Table/SelectorTable/SelectorTable";
import { HoursWorked } from "../models/HoursWorked";
import { useWeeklySummaries } from "../hooks/useWeeklySummary";
import { useBiweeklySummaries } from "../hooks/useBiweeklySummary";
import { useMonthlySummaries } from "../hooks/useMonthlySummary";
import { WeeklySummary } from "../models/WeeklySummary";
import { BiweeklySummary } from "../models/BiweeklySummary";
import { MonthlySummary } from "../models/MonthlySummary";
import { setDayOptionsEnglish } from "../utils/stringUtils";

const ManageRoles: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { employees, isLoadingEmployees } = useEmployees();
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const { schedules, isLoadingSchedules } = useSchedules();
  const { hoursWorked, isLoadingHours, handleAddOrUpdateHours } = useHours();
  const {
    weeklySummaries,
    isLoadingWeeklySummaries,
    handleAddOrUpdateWeeklySummary,
  } = useWeeklySummaries();
  const {
    biweeklySummaries,
    isLoadingBiweeklySummaries,
    handleAddOrUpdateBiweeklySummary,
  } = useBiweeklySummaries();
  const {
    monthlySummaries,
    isLoadingMonthlySummaries,
    handleAddOrUpdateMonthlySummary,
  } = useMonthlySummaries();
  const [weekOffset, setWeekOffset] = useState(0);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<Date | null>(new Date());
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number>(0);
  const [currentBiweekNumber, setCurrentBiweekNumber] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [filter, setFilter] = useState("");

  const isLoading =
    isLoadingEmployees ||
    isLoadingSchedules ||
    isLoadingHours ||
    isLoadingWeeklySummaries ||
    isLoadingBiweeklySummaries ||
    isLoadingMonthlySummaries;

  useEffect(() => {
    setFilteredEmployees(
      employees.filter((employee) =>
        `${employee.firstName} ${employee.lastName}`
          .toLowerCase()
          .includes(filter.toLowerCase())
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

  const handleAddOrUpdateHoursWorked = useCallback(
    (employeeId: number, date: Date, scheduleId: number, id?: number) => {
      const newId =
        id ??
        (hoursWorked.length > 0
          ? Math.max(...hoursWorked.map((hours) => hours.id || 0), 0) + 1
          : 1);

      const newHoursWorked: HoursWorked = {
        id: newId,
        employeeId,
        date,
        scheduleId,
      };
      handleAddOrUpdateHours(newHoursWorked);
    },
    [hoursWorked, handleAddOrUpdateHours]
  );

  const handleAddOrUpdateWeeklySummaries = useCallback(
    (
      employeeId: number,
      weekNumber: number,
      month: number,
      year: number,
      totalHours: number,
      id?: number
    ) => {
      const newId =
        id ??
        (weeklySummaries.length > 0
          ? Math.max(
              ...weeklySummaries.map((weeklySummary) => weeklySummary.id || 0),
              0
            ) + 1
          : 1);

      const newWeeklySummaries: WeeklySummary = {
        id: newId,
        employeeId,
        weekNumber,
        month,
        year,
        totalHours,
      };
      handleAddOrUpdateWeeklySummary(newWeeklySummaries);
    },
    [weeklySummaries, handleAddOrUpdateWeeklySummary]
  );

  const handleAddOrUpdateBiweeklySummaries = useCallback(
    (
      employeeId: number,
      biweekNumber: number,
      month: number,
      year: number,
      totalHours: number,
      id?: number
    ) => {
      const newId =
        id ??
        (biweeklySummaries.length > 0
          ? Math.max(
              ...biweeklySummaries.map(
                (biweeklySummaries) => biweeklySummaries.id || 0
              ),
              0
            ) + 1
          : 1);

      const newBiweeklySummaries: BiweeklySummary = {
        id: newId,
        employeeId,
        biweekNumber,
        month,
        year,
        totalHours,
      };
      handleAddOrUpdateBiweeklySummary(newBiweeklySummaries);
    },
    [biweeklySummaries, handleAddOrUpdateBiweeklySummary]
  );

  const handleAddOrUpdateMonthlySummaries = useCallback(
    (
      employeeId: number,
      month: number,
      year: number,
      totalHours: number,
      id?: number
    ) => {
      const newId =
        id ??
        (monthlySummaries.length > 0
          ? Math.max(
              ...monthlySummaries.map(
                (monthlySummaries) => monthlySummaries.id || 0
              ),
              0
            ) + 1
          : 1);

      const newMonthlySummaries: MonthlySummary = {
        id: newId,
        employeeId,
        month,
        year,
        totalHours,
      };
      handleAddOrUpdateMonthlySummary(newMonthlySummaries);
    },
    [monthlySummaries, handleAddOrUpdateMonthlySummary]
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const handleDateChange = (newDate: Date | null) => {
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
    setSelectedDate(newDate);
    setFirstDayOfWeek(newDate);
  };

  const handleChange = (
    event: SelectChangeEvent<string>,
    employeeId: number,
    date: Date
  ) => {
    const selectedSchedule = schedules.find(
      (schedule) =>
        schedule.label === event.target.value &&
        schedule.day === setDayOptionsEnglish(getDayName(date))
    );

    if (!selectedSchedule) {
      console.error("No se encontró un horario para el label seleccionado");
      return;
    }

    handleAddOrUpdateHoursWorked(employeeId, date, selectedSchedule.id);
    handleAddOrUpdateWeeklySummaries(
      employeeId,
      currentWeekNumber,
      date.getMonth(),
      date.getFullYear(),
      selectedSchedule.hours
    );
    handleAddOrUpdateBiweeklySummaries(
      employeeId,
      currentBiweekNumber,
      date.getMonth(),
      date.getFullYear(),
      selectedSchedule.hours
    );
    handleAddOrUpdateMonthlySummaries(
      employeeId,
      date.getMonth(),
      date.getFullYear(),
      selectedSchedule.hours
    );

    console.log("Horario:", selectedSchedule.label);
    console.log("Horas:", selectedSchedule.hours);
    console.log("Empleado:", employeeId);
    console.log("Fecha:", date);
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

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant={isSmallScreen ? "h4" : "h2"} sx={{ flexGrow: 1 }}>
          {PAGE_TITLE.MANAGE_ROLES}
        </Typography>
        {filteredEmployees.length > 0 && (
          <SplitButton
            options={createExportOptions(
              <FontAwesomeIcon icon={faFileExcel} size="lg" />,
              <FontAwesomeIcon icon={faFilePdf} size="lg" />,
              exportToExcel,
              exportToPDF,
              filteredEmployees,
              `reporte-de-roles-${exportFileFormattedDate(
                selectedDate || new Date()
              )}`
            )}
            defaultIndex={0}
            buttonIcon={<DownloadRoundedIcon />}
          />
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
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
                  localeText={{
                    okButtonLabel: "Aceptar",
                    cancelButtonLabel: "Cancelar",
                    todayButtonLabel: "Hoy",
                    year: "Año #{currentYear}",
                    previousMonth: "Mes anterior",
                    nextMonth: "Mes siguiente",
                  }}
                >
                  <DatePicker
                    label="Seleccionar fecha"
                    value={firstDayOfWeek || null}
                    sx={{
                      width: { xs: "100%", sm: "100%", md: "auto" },
                      mt: { xs: 2, sm: 2, md: 0 },
                    }}
                    maxDate={nextWeekEnd}
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
              weekOffset={weekOffset}
              weekNumber={currentWeekNumber}
              biweekNumber={currentBiweekNumber}
              month={currentMonth}
              year={currentYear}
              handleChange={handleChange}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "10%",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                No se encontraron empleados para mostrar.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ManageRoles;
