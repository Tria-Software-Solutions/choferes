import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DropdownTable from "../components/Table/DropdownTable/DropdownTable";
import SearchBar from "../components/SearchBar/SearchBar";
import SplitButton from "../components/SplitButton/SplitButton";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Employee } from "../models/Employee";
import { useEmployees } from "../hooks/useEmployee";
import { useSchedules } from "../hooks/useSchedule";
import { useHours } from "../hooks/useHours";
import { useWeeklySummaries } from "../hooks/useWeeklySummary";
import { useMonthlySummaries } from "../hooks/useMonthlySummary";
import { useBiweeklySummaries } from "../hooks/useBiweeklySummary";
import { useSummaries } from "../hooks/useSummaries";
import {
  createExportOptions,
  exportToExcel,
  exportToPDF,
  handleExportTableData,
} from "../utils/exportUtils";
import { setDayOptionsEnglish } from "../utils/stringUtils";
import {
  getBiweekNumber,
  getCurrentWeekDates,
  getFirstDayOfWeek,
  getMonthNumber,
  getWeekNumber,
  isValidDateForSelect,
} from "../utils/dateUtils";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { updateHoursAndSummaries } from "../utils/calculationsUtils";
import { es } from "date-fns/locale";
import {
  addWeeks,
  differenceInCalendarWeeks,
  endOfWeek,
  startOfWeek,
} from "date-fns";
import { PAGE_TITLE } from "../constants/constants";

const ManageRoles: React.FC = () => {
  const { employees } = useEmployees();
  const { schedules } = useSchedules();
  const { hoursWorked, fetchHours, handleAddHours, handleUpdateHours } =
    useHours();
  const { handleSummaryChange, handleSummaryUpdate } = useSummaries();
  const [filteredRoles, setFilteredRoles] = useState(true);
  const { weeklySummaries, fetchWeeklySummaries } = useWeeklySummaries();
  const { biweeklySummaries, fetchBiweeklySummaries } = useBiweeklySummaries();
  const { monthlySummaries, fetchMonthlySummaries } = useMonthlySummaries();
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number>(0);
  const [currentBiweekNumber, setCurrentBiweekNumber] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);
  const [period, setPeriod] = useState<"weekly" | "biweekly" | "monthly">(
    "weekly"
  );
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<Date | null>(new Date());
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const currentWeek = getCurrentWeekDates(weekOffset);
    if (currentWeek.length > 0) {
      const firstDayOfWeek = new Date(currentWeek[0].date);
      setCurrentWeekNumber(getWeekNumber(firstDayOfWeek));
      setCurrentBiweekNumber(getBiweekNumber(firstDayOfWeek));
      setCurrentMonth(getMonthNumber(firstDayOfWeek));
      setCurrentYear(new Date().getFullYear());
    }
  }, [weekOffset]);

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

  const filteredEmployees = employees.filter((employee) =>
    `${employee.firstName} ${employee.lastName}`
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  useEffect(() => {
    setFilteredRoles(filteredEmployees.length > 0);
  }, [filter, employees, filteredEmployees.length]);

  const handleDateChange = (newDate: Date | null) => {
    setFirstDayOfWeek(newDate);
    if (newDate) {
      const today = new Date();
      const weekOptions: { weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {
        weekStartsOn: 1,
      };
      setWeekOffset(differenceInCalendarWeeks(newDate, today, weekOptions));
    }
  };

  const handleChange = async (
    employee: Employee,
    day: string,
    date: Date,
    selectedLabel: string
  ) => {
    const selectedSchedule = schedules.find(
      (schedule) =>
        schedule.label === selectedLabel &&
        schedule.day === setDayOptionsEnglish(day)
    );

    if (!selectedSchedule) {
      console.error("No se encontró un horario para el label seleccionado");
      return;
    }

    await updateHoursAndSummaries(
      employee,
      schedules,
      hoursWorked,
      weeklySummaries,
      biweeklySummaries,
      monthlySummaries,
      date,
      weekOffset,
      getWeekNumber(date),
      getBiweekNumber(date),
      getMonthNumber(date),
      date.getFullYear(),
      selectedSchedule,
      handleAddHours,
      handleUpdateHours,
      handleSummaryChange,
      handleSummaryUpdate,
      fetchHours
    );

    await fetchWeeklySummaries();
    await fetchBiweeklySummaries();
    await fetchMonthlySummaries();
  };

  const { dataForExport, headers, fileName } = handleExportTableData(
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
    period
  );

  const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), {
    weekStartsOn: 1,
  });
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box>
      {filteredRoles ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography
              variant={isSmallScreen ? "h4" : "h2"}
              sx={{ flexGrow: 1 }}
            >
              {PAGE_TITLE.MANAGE_ROLES}
            </Typography>
            {filteredRoles && (
              <SplitButton
                options={createExportOptions(
                  <FontAwesomeIcon icon={faFileExcel} size="lg" />,
                  <FontAwesomeIcon icon={faFilePdf} size="lg" />,
                  exportToExcel,
                  exportToPDF,
                  dataForExport,
                  fileName,
                  headers
                )}
                defaultIndex={0}
                buttonIcon={<DownloadRoundedIcon />}
              />
            )}
          </Box>
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={12} md={6}>
              <SearchBar
                placeholder="Buscar empleado"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  maxWidth: "100%",
                }}
                fullWidth
              />
            </Grid>
            {filteredRoles && (
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
                      value={firstDayOfWeek}
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
            )}
          </Grid>
          <br />
          <DropdownTable
            filteredEmployees={filteredEmployees}
            schedules={schedules}
            hoursWorked={hoursWorked}
            weekOffset={weekOffset}
            weekNumber={currentWeekNumber}
            biweekNumber={currentBiweekNumber}
            month={currentMonth}
            year={currentYear}
            setPeriod={setPeriod}
            handleChange={handleChange}
            weeklySummaries={weeklySummaries}
            biweeklySummaries={biweeklySummaries}
            monthlySummaries={monthlySummaries}
          />
        </>
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
    </Box>
  );
};

export default ManageRoles;
