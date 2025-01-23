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
import { differenceInCalendarWeeks } from "date-fns";

const Dashboard: React.FC = () => {
  const { employees } = useEmployees();
  const { schedules } = useSchedules();
  const { hoursWorked, fetchHours, handleAddHours, handleUpdateHours } =
    useHours();
  const { handleSummaryChange, handleSummaryUpdate } = useSummaries();
  const { weeklySummaries, fetchWeeklySummaries } = useWeeklySummaries();
  const { biweeklySummaries, fetchBiweeklySummaries } = useBiweeklySummaries();
  const { monthlySummaries, fetchMonthlySummaries } = useMonthlySummaries();
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekNumber, setWeekNumber] = useState<number>(0);
  const [biweekNumber, setBiweekNumber] = useState<number>(0);
  const [month, setMonth] = useState<number>(0);
  const [year, setYear] = useState<number>(0);
  const [period, setPeriod] = useState<"weekly" | "biweekly" | "monthly">(
    "weekly"
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [filter, setFilter] = useState("");
  const [showResults, setShowResults] = useState(true);

  useEffect(() => {
    const currentWeek = getCurrentWeekDates(weekOffset);
    if (currentWeek.length > 0) {
      const firstDayOfWeek = new Date(currentWeek[0].date);
      setWeekNumber(getWeekNumber(firstDayOfWeek));
      setBiweekNumber(getBiweekNumber(firstDayOfWeek));
      setMonth(getMonthNumber(firstDayOfWeek));
      setYear(new Date().getFullYear());
    }
  }, [weekOffset]);

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1);
    setSelectedDate(getFirstDayOfWeek(weekOffset + 1));
  };

  const handlePreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
    setSelectedDate(getFirstDayOfWeek(weekOffset - 1));
  };

  const handleCurrentWeek = () => {
    setWeekOffset(0);
    setSelectedDate(new Date());
  };

  const filteredEmployees = employees.filter((employee) =>
    `${employee.firstName} ${employee.lastName}`
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  useEffect(() => {
    setShowResults(filteredEmployees.length > 0);
  }, [filter, employees, filteredEmployees.length]);

  const handleDateChange = (newDate: Date | null) => {
    setSelectedDate(newDate);
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
      weekNumber,
      biweekNumber,
      month,
      year,
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
    weekNumber,
    biweekNumber,
    month,
    year,
    getCurrentWeekDates(weekOffset),
    period
  );

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
          Administrar Roles
        </Typography>
        {showResults && (
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
        <Grid item xs={12} sm={6} md={4}>
          <SearchBar
            placeholder="Buscar Empleado"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            fullWidth
          />
        </Grid>
        {showResults && (
          <Grid item xs={12} sm={6} md={8}>
            <Box
              display="flex"
              alignItems="center"
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              <Tooltip title="Semana Anterior" arrow>
                <Button
                  variant="contained"
                  sx={{ mr: 2, height: "56px" }}
                  onClick={handlePreviousWeek}
                >
                  <ArrowBackIosNewRoundedIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Semana Siguiente" arrow>
                <span>
                  <Button
                    variant="contained"
                    sx={{ mr: 2, height: "56px" }}
                    disabled={
                      !isValidDateForSelect(
                        new Date(getCurrentWeekDates(weekOffset + 1)[0].isoDate)
                      )
                    }
                    onClick={handleNextWeek}
                  >
                    <ArrowForwardIosRoundedIcon />
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Semana Actual" arrow>
                <span>
                  <Button
                    variant="contained"
                    sx={{ mr: 2, height: "56px" }}
                    disabled={weekOffset === 0}
                    onClick={handleCurrentWeek}
                  >
                    <CalendarTodayRoundedIcon />
                  </Button>
                </span>
              </Tooltip>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={es}
                localeText={{
                  okButtonLabel: "Aceptar",
                  cancelButtonLabel: "Cancelar",
                  todayButtonLabel: "Hoy",
                  year: "Año #{year}",
                  previousMonth: "Mes anterior",
                  nextMonth: "Mes siguiente",
                }}
              >
                <DatePicker
                  label="Seleccionar fecha"
                  value={selectedDate}
                  sx={{ width: { xs: "100%", sm: "180px" } }}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
            </Box>
          </Grid>
        )}
      </Grid>
      <br />

      {showResults ? (
        <DropdownTable
          filteredEmployees={filteredEmployees}
          schedules={schedules}
          hoursWorked={hoursWorked}
          weekOffset={weekOffset}
          weekNumber={weekNumber}
          biweekNumber={biweekNumber}
          month={month}
          year={year}
          setPeriod={setPeriod}
          handleChange={handleChange}
          weeklySummaries={weeklySummaries}
          biweeklySummaries={biweeklySummaries}
          monthlySummaries={monthlySummaries}
        />
      ) : (
        <Typography variant="h6" color="textSecondary">
          No se encontraron empleados para mostrar.
        </Typography>
      )}
    </Box>
  );
};

export default Dashboard;
