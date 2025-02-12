import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TablePagination,
  InputLabel,
  TableSortLabel,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Tab,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import ModalComponent from "../../Modal/ModalComponent";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
import {
  formatDate,
  formatDateWithoutYear,
  formatHeaderDate,
  getBiweeklyDates,
  getCurrentWeekDates,
  getInvolvedPeriods,
  hasMultipleBiweeks,
  hasMultipleMonths,
  hasMultipleYears,
  isValidDateForSelect,
} from "../../../utils/dateUtils";
import { getBackgroundColor } from "../../../utils/tableUtils";
import {
  getMonthName,
  getOptionsForDay,
  translateDayToAbrevSpanish,
} from "../../../utils/stringUtils";
import { EnglishDayOfWeek } from "../../../utils/englishDayOfWeek";
import { STATE, TABLE } from "../../../constants/constants";
import { format } from "date-fns";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

interface DropdownTableProps {
  filteredEmployees: Employee[];
  schedules: Schedule[];
  hoursWorked: HoursWorked[];
  weekOffset: number;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  setPeriod: React.Dispatch<
    React.SetStateAction<"weekly" | "biweekly" | "monthly">
  >;
  handleChange: (
    employee: Employee,
    day: string,
    date: Date,
    selectedLabel: string
  ) => void;
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
}

const DropdownTable: React.FC<DropdownTableProps> = React.memo(
  ({
    filteredEmployees,
    schedules,
    hoursWorked,
    weekOffset,
    weekNumber,
    biweekNumber,
    month,
    year,
    setPeriod,
    handleChange,
    weeklySummaries,
    biweeklySummaries,
    monthlySummaries,
  }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedPeriod, setSelectedPeriod] = useState<
      "weekly" | "biweekly" | "monthly"
    >("weekly");
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [tabValue, setTabValue] = React.useState("1");

    const currentWeek = useMemo(
      () => getCurrentWeekDates(weekOffset),
      [weekOffset]
    );

    useEffect(() => {
      setPeriod(selectedPeriod);
    }, [selectedPeriod, setPeriod]);

    const getTotalWeekly = useMemo(() => {
      return filteredEmployees.map((employee) => {
        const summary = weeklySummaries.find(
          (s) =>
            s.employeeId === employee.id &&
            s.weekNumber === weekNumber &&
            s.year === year
        );

        const totalHours = summary ? summary.totalHours : 0;

        return {
          employeeId: employee.id,
          weekNumber,
          totalHours,
        };
      });
    }, [filteredEmployees, weekNumber, year, weeklySummaries]);

    const getTotalBiweekly = useMemo(() => {
      return filteredEmployees.map((employee) => {
        const summaries = biweeklySummaries.filter(
          (s) => s.employeeId === employee.id && s.year === year
        );
        return {
          employeeId: employee.id,
          totalHours: summaries,
        };
      });
    }, [filteredEmployees, year, biweeklySummaries]);

    const getTotalMonthly = useMemo(() => {
      return filteredEmployees.map((employee) => {
        const summary = monthlySummaries.find(
          (s) =>
            s.employeeId === employee.id && s.month === month && s.year === year
        );

        const totalHours = summary ? summary.totalHours : 0;

        return {
          employeeId: employee.id,
          month,
          totalHours,
        };
      });
    }, [filteredEmployees, month, year, monthlySummaries]);

    const multipleWeeksOutput = (employee: Employee): string => {
      const weeks = getInvolvedPeriods(currentWeek).weekNumbers;
      return weeks
        .map(
          (week) =>
            `${
              getTotalWeekly.find(
                (emp) =>
                  emp.employeeId === employee.id &&
                  emp.weekNumber === week.weekNumber
              )?.totalHours || 0
            }`
        )
        .join(" / ");
    };

    const multipleBiweeksOutput = (employee: Employee): string => {
      const biweeks = getInvolvedPeriods(currentWeek).biweekNumbers;
      const employeeData = getTotalBiweekly.find(
        (emp) => emp.employeeId === employee.id
      );
      return biweeks
        .map((biweek) => {
          const summary = employeeData?.totalHours.find(
            (s) => s.biweekNumber === biweek
          );
          return `${summary ? summary.totalHours : 0}`;
        })
        .join(" / ");
    };

    const multipleMonthsOutput = (employee: Employee): string => {
      const months = getInvolvedPeriods(currentWeek).months;
      return months
        .map(
          (month) =>
            `${
              getTotalMonthly.find(
                (emp) => emp.employeeId === employee.id && emp.month === month
              )?.totalHours || 0
            }`
        )
        .join(" / ");
    };

    const getTotalOvertime = useMemo(() => {
      return filteredEmployees.map((employee) => {
        const summary = biweeklySummaries.find(
          (s) =>
            s.employeeId === employee.id &&
            s.biweekNumber === biweekNumber &&
            s.year === year
        );

        const totalHours = summary ? summary.totalHours : 0;
        const overtime = totalHours > 96 ? totalHours - 96 : 0;

        return {
          employeeId: employee.id,
          totalHours,
          overtime,
        };
      });
    }, [filteredEmployees, biweekNumber, year, biweeklySummaries]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setTabValue(newValue);
    };

    const sortedEmployees = useMemo(() => {
      return [...filteredEmployees].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return orderDirection === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }, [filteredEmployees, orderDirection]);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const multiplePeriods = getInvolvedPeriods(currentWeek);

    if (!filteredEmployees || filteredEmployees.length === 0) {
      return (
        <Typography variant="h6" color="textSecondary">
          No se encontraron empleados disponibles.
        </Typography>
      );
    }

    return (
      <Paper sx={{ width: "100%" }}>
        <TableContainer className="table-container">
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={9}>
                  {selectedPeriod === "weekly" ? (
                    <div>
                      {hasMultipleYears(currentWeek) ? (
                        <Typography variant="body2">{`Semanas ${multiplePeriods.weekNumbers[1].weekNumber} / ${multiplePeriods.weekNumbers[0].weekNumber}`}</Typography>
                      ) : (
                        <Typography variant="body2">{`Semana ${weekNumber}`}</Typography>
                      )}
                    </div>
                  ) : selectedPeriod === "biweekly" ? (
                    <div>
                      {hasMultipleBiweeks(currentWeek) ? (
                        <Typography variant="body2">{`Quincenas ${multiplePeriods.biweekNumbers[0]} / ${multiplePeriods.biweekNumbers[1]}`}</Typography>
                      ) : (
                        <Typography variant="body2">{`Quincena ${biweekNumber}`}</Typography>
                      )}
                    </div>
                  ) : (
                    <div>
                      {hasMultipleMonths(currentWeek) ? (
                        <Typography variant="body2">{`${getMonthName(
                          multiplePeriods.months[0]
                        )} / ${getMonthName(
                          multiplePeriods.months[1]
                        )}`}</Typography>
                      ) : (
                        <Typography variant="body2">{`${getMonthName(
                          month
                        )}`}</Typography>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  className="employee-column"
                  sx={{ position: "sticky", left: 0, zIndex: 3 }}
                >
                  <TableSortLabel
                    direction={orderDirection}
                    onClick={() =>
                      setOrderDirection((prev) =>
                        prev === "asc" ? "desc" : "asc"
                      )
                    }
                  >
                    Empleados
                  </TableSortLabel>
                </TableCell>
                {currentWeek.map(({ day, date }) => (
                  <TableCell key={day} align="center">
                    {`${translateDayToAbrevSpanish(
                      day as EnglishDayOfWeek
                    )} ${formatHeaderDate(date)}`}
                  </TableCell>
                ))}
                <TableCell
                  align="center"
                  sx={{
                    position: isSmallScreen ? "static" : "sticky",
                    right: 0,
                    zIndex: 2,
                  }}
                  colSpan={2}
                >
                  <FormControl>
                    <InputLabel>Total</InputLabel>
                    <Select
                      value={selectedPeriod}
                      onChange={(e) =>
                        setSelectedPeriod(
                          e.target.value as "weekly" | "biweekly" | "monthly"
                        )
                      }
                      autoWidth
                      label="Total"
                    >
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="biweekly">Quincenal</MenuItem>
                      <MenuItem value="monthly">Mensual</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee, rowIndex) => (
                <TableRow
                  key={employee.id}
                  sx={{ backgroundColor: getBackgroundColor(rowIndex) }}
                >
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      backgroundColor: getBackgroundColor(rowIndex),
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <ModalComponent
                        buttonType="icon"
                        buttonIcon={<InfoRoundedIcon />}
                        modalTitle={`${employee.firstName} ${employee.lastName}`}
                        modalDescription="Resumen del total de horas trabajadas"
                        children={
                          <TabContext value={tabValue}>
                            <Box sx={{ bgcolor: "background.paper" }}>
                              <TabList
                                onChange={handleTabChange}
                                sx={{ padding: 0, margin: 0 }}
                              >
                                <Tab label="Semanal" value="1" />
                                <Tab label="Quincenal" value="2" />
                                <Tab label="Mensual" value="3" />
                                <Tab label="Horas Extra" value="4" />
                              </TabList>
                            </Box>
                            <TabPanel
                              value="1"
                              sx={{ paddingLeft: 0, paddingRight: 0 }}
                            >
                              <Typography variant="body2">
                                {`${employee.firstName} ha trabajado un total de `}
                                <strong>
                                  {getTotalWeekly.find(
                                    (emp) => emp.employeeId === employee.id
                                  )?.totalHours || 0}
                                </strong>
                                {` horas en la semana número `}
                                <strong>{weekNumber}</strong>
                                {`, que comprende del ${formatDate(
                                  new Date(currentWeek[0]?.date),
                                  false
                                )} al ${formatDate(
                                  new Date(currentWeek[6]?.date),
                                  false
                                )} `}
                              </Typography>
                            </TabPanel>
                            <TabPanel
                              value="2"
                              sx={{ paddingLeft: 0, paddingRight: 0 }}
                            >
                              <Typography variant="body2">
                                {`${employee.firstName} ha trabajado un total de `}
                                <strong>
                                  {getTotalBiweekly
                                    .find(
                                      (emp) => emp.employeeId === employee.id
                                    )
                                    ?.totalHours.find(
                                      (s) => s.biweekNumber === biweekNumber
                                    )?.totalHours || 0}
                                </strong>
                                {` horas en la quincena número `}{" "}
                                <strong>{biweekNumber}</strong>
                                {`, que comprende del ${formatDate(
                                  getBiweeklyDates(year, biweekNumber)
                                    .startDate,
                                  false
                                )} al ${formatDate(
                                  getBiweeklyDates(year, biweekNumber)
                                    .startDate,
                                  false
                                )}`}
                              </Typography>
                            </TabPanel>
                            <TabPanel
                              value="3"
                              sx={{ paddingLeft: 0, paddingRight: 0 }}
                            >
                              <Typography variant="body2">
                                {`${employee.firstName} ha trabajado un total de `}
                                <strong>
                                  {getTotalMonthly.find(
                                    (emp) => emp.employeeId === employee.id
                                  )?.totalHours || 0}
                                </strong>
                                {` horas en el mes de ${getMonthName(
                                  month
                                )} del ${year}`}
                              </Typography>
                            </TabPanel>
                            <TabPanel
                              value="4"
                              sx={{ paddingLeft: 0, paddingRight: 0 }}
                            >
                              <Typography variant="body2">
                                {`${employee.firstName} ha trabajado un total de `}
                                <strong>
                                  {getTotalOvertime.find(
                                    (emp) => emp.employeeId === employee.id
                                  )?.overtime || 0}
                                </strong>
                                {` horas extra en la quincena del ${formatDate(
                                  getBiweeklyDates(year, biweekNumber)
                                    .startDate,
                                  false
                                )} al ${formatDate(
                                  getBiweeklyDates(year, biweekNumber)
                                    .startDate,
                                  false
                                )}`}
                              </Typography>
                            </TabPanel>
                          </TabContext>
                        }
                      />
                    </Box>
                  </TableCell>
                  {currentWeek.map(({ day, date }) => {
                    const existingRecord = hoursWorked.find(
                      (record) =>
                        record.employeeId === employee.id &&
                        new Date(record.date).toISOString().split("T")[0] ===
                          new Date(date).toISOString().split("T")[0]
                    );

                    const options = getOptionsForDay(day, schedules);
                    const validLabels = options.map((option) => option.label);
                    const priorityOptions = [
                      "Ausencia",
                      "Cubre Almuerzo",
                      "Libre",
                      "Salida Programada",
                    ];

                    const selectedLabel = existingRecord
                      ? schedules.find(
                          (schedule) =>
                            schedule.id === existingRecord.scheduleId
                        )?.label || STATE.FREE
                      : STATE.FREE;

                    const finalSelectedLabel = validLabels.includes(
                      selectedLabel
                    )
                      ? selectedLabel
                      : validLabels[0] || "";

                    const sortedOptions = [...options].sort((a, b) => {
                      const indexA = priorityOptions.indexOf(a.label);
                      const indexB = priorityOptions.indexOf(b.label);

                      if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                      }

                      if (indexA !== -1) return 1;
                      if (indexB !== -1) return -1;

                      return a.label.localeCompare(b.label);
                    });
                    return (
                      <TableCell
                        key={day}
                        sx={{
                          backgroundColor:
                            format(new Date(), "yyyy-MM-dd") ===
                            format(new Date(date), "yyyy-MM-dd")
                              ? "#e4f5ed"
                              : "inherit",
                        }}
                      >
                        <FormControl fullWidth>
                          <Select
                            value={finalSelectedLabel}
                            onChange={(e) =>
                              handleChange(
                                employee,
                                day,
                                new Date(date),
                                e.target.value
                              )
                            }
                            disabled={!isValidDateForSelect(new Date(date))}
                          >
                            {sortedOptions.map((option, index) => {
                              const items = [
                                <MenuItem key={option.id} value={option.label}>
                                  {option.label}
                                </MenuItem>,
                              ];

                              if (option.label === "Ausencia" && index > 0) {
                                items.unshift(<Divider key="divider" />);
                              }

                              return items;
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>
                    );
                  })}
                  <TableCell
                    align="left"
                    sx={{
                      position: isSmallScreen ? "static" : "sticky",
                      right: 0,
                      zIndex: 2,
                      backgroundColor: getBackgroundColor(rowIndex),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "64px",
                        paddingX: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexGrow: 1,
                          justifyContent: "center",
                        }}
                      >
                        <strong>
                          {selectedPeriod === "weekly"
                            ? hasMultipleYears(currentWeek)
                              ? multipleWeeksOutput(employee)
                              : getTotalWeekly.find(
                                  (emp) => emp.employeeId === employee.id
                                )?.totalHours || 0
                            : selectedPeriod === "biweekly"
                            ? hasMultipleBiweeks(currentWeek)
                              ? multipleBiweeksOutput(employee)
                              : getTotalBiweekly
                                  .find((emp) => emp.employeeId === employee.id)
                                  ?.totalHours.find(
                                    (s) => s.biweekNumber === biweekNumber
                                  )?.totalHours || 0
                            : hasMultipleMonths(currentWeek)
                            ? multipleMonthsOutput(employee)
                            : getTotalMonthly.find(
                                (emp) => emp.employeeId === employee.id
                              )?.totalHours || 0}
                        </strong>
                        &nbsp;horas
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", ml: 1 }}
                      >
                        <Tooltip title="Horas Extra" arrow>
                          <Box>
                            <Badge
                              badgeContent={
                                getTotalOvertime.find(
                                  (emp) => emp.employeeId === employee.id
                                )?.overtime || 0
                              }
                              color={
                                (getTotalOvertime.find(
                                  (emp) => emp.employeeId === employee.id
                                )?.overtime || 0) > 0
                                  ? "warning"
                                  : "success"
                              }
                              showZero
                            >
                              <AccessTimeRoundedIcon />
                            </Badge>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {!isSmallScreen && (
            <div>
              {selectedPeriod === "weekly" ? (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Semana del{" "}
                  {formatDateWithoutYear(new Date(currentWeek[0]?.date))} al{" "}
                  {formatDate(new Date(currentWeek[6]?.date), false)}
                </Typography>
              ) : selectedPeriod === "biweekly" ? (
                <div>
                  {hasMultipleBiweeks(currentWeek) ? (
                    <Typography
                      variant="body2"
                      sx={{ ml: 2 }}
                    >{`Quincenas del ${formatDateWithoutYear(
                      getBiweeklyDates(year, multiplePeriods.biweekNumbers[0])
                        .startDate
                    )} al ${formatDateWithoutYear(
                      getBiweeklyDates(year, multiplePeriods.biweekNumbers[0])
                        .endDate
                    )} / ${formatDateWithoutYear(
                      getBiweeklyDates(year, multiplePeriods.biweekNumbers[1])
                        .startDate
                    )} al ${formatDateWithoutYear(
                      getBiweeklyDates(year, multiplePeriods.biweekNumbers[1])
                        .endDate
                    )} del ${year}`}</Typography>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ ml: 2 }}
                    >{`Quincena del ${formatDateWithoutYear(
                      getBiweeklyDates(year, biweekNumber).startDate
                    )} al ${formatDateWithoutYear(
                      getBiweeklyDates(year, biweekNumber).endDate
                    )}`}</Typography>
                  )}
                </div>
              ) : (
                <div>
                  {hasMultipleMonths(currentWeek) ? (
                    <Typography variant="body2" sx={{ ml: 2 }}>{`${getMonthName(
                      multiplePeriods.months[0]
                    )} / ${getMonthName(
                      multiplePeriods.months[1]
                    )} del ${year}`}</Typography>
                  ) : (
                    <Typography variant="body2" sx={{ ml: 2 }}>{`${getMonthName(
                      month
                    )}`}</Typography>
                  )}
                </div>
              )}
            </div>
          )}
          <TablePagination
            className="pagination"
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={sortedEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={TABLE.ROWS_PER_PAGE}
          />
        </Box>
      </Paper>
    );
  }
);

export default DropdownTable;
