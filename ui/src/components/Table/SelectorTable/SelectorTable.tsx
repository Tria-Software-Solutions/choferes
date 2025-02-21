import React, { useMemo, useState } from "react";
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
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Tab,
  SelectChangeEvent,
  Badge,
  Tooltip,
} from "@mui/material";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
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
import {
  getMonthName,
  getOptionsForDay,
  translateDayToAbrevSpanish,
} from "../../../utils/stringUtils";
import { EnglishDayOfWeek } from "../../../utils/englishDayOfWeek";
import {
  STATE,
  TABLE,
  DEFAULT_SCHEDULE_VALUES,
} from "../../../constants/constants";
import ModalComponent from "../../Modal/ModalComponent";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  calculateTotalHoursAndOvertimeForPeriod,
  calculateTotalHoursAndOvertimeForPeriods,
} from "../../../utils/calculationUtils";
import { format } from "date-fns";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

interface SelectorTableProps {
  filteredEmployees: Employee[];
  schedules: Schedule[];
  hoursWorked: HoursWorked[];
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
  weekOffset: number;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  handleChange: (
    event: SelectChangeEvent<string>,
    employeeId: number,
    date: Date
  ) => void;
}

const SelectorTable: React.FC<SelectorTableProps> = React.memo(
  ({
    filteredEmployees,
    schedules,
    hoursWorked,
    weeklySummaries,
    biweeklySummaries,
    monthlySummaries,
    weekOffset,
    weekNumber,
    biweekNumber,
    month,
    year,
    handleChange,
  }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<
      "weekly" | "biweekly" | "monthly"
    >("weekly");
    const [tabValue, setTabValue] = React.useState(0);
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const currentWeek = useMemo(
      () => getCurrentWeekDates(weekOffset),
      [weekOffset]
    );
    const multiplePeriods = getInvolvedPeriods(currentWeek);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    };

    const sortedEmployees = useMemo(() => {
      return [...filteredEmployees].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
      });
    }, [filteredEmployees]);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const resultHoursForPeriod = (
      employee: Employee,
      period: "weekly" | "biweekly" | "monthly",
      type: "totalHours" | "overtime"
    ) => {
      if (type === "totalHours") {
        return calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          period,
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).totalHours;
      } else {
        return calculateTotalHoursAndOvertimeForPeriod(
          employee.id,
          period,
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).overtime;
      }
    };

    const resultHoursForPeriods = (
      employee: Employee,
      period: "weekly" | "biweekly" | "monthly",
      type: "totalHours" | "overtime"
    ) => {
      if (type === "totalHours") {
        return calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          period,
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).totalHours;
      } else {
        return calculateTotalHoursAndOvertimeForPeriods(
          employee.id,
          period,
          multiplePeriods.weekNumbers,
          multiplePeriods.biweekNumbers,
          multiplePeriods.months,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries
        ).overtime;
      }
    };

    const resultTotalHours = (employee: Employee) => {
      return selectedPeriod === "weekly"
        ? hasMultipleYears(currentWeek)
          ? resultHoursForPeriods(employee, selectedPeriod, "totalHours")
          : resultHoursForPeriod(employee, selectedPeriod, "totalHours")
        : selectedPeriod === "biweekly"
        ? hasMultipleYears(currentWeek) || hasMultipleBiweeks(currentWeek)
          ? resultHoursForPeriods(employee, selectedPeriod, "totalHours")
          : resultHoursForPeriod(employee, selectedPeriod, "totalHours")
        : hasMultipleYears(currentWeek) || hasMultipleMonths(currentWeek)
        ? resultHoursForPeriods(employee, selectedPeriod, "totalHours")
        : resultHoursForPeriod(employee, selectedPeriod, "totalHours");
    };

    const resultOvertime = (employee: Employee) => {
      return selectedPeriod === "weekly"
        ? hasMultipleYears(currentWeek)
          ? resultHoursForPeriods(employee, selectedPeriod, "overtime")
          : resultHoursForPeriod(employee, selectedPeriod, "overtime")
        : selectedPeriod === "biweekly"
        ? hasMultipleYears(currentWeek) || hasMultipleBiweeks(currentWeek)
          ? resultHoursForPeriods(employee, selectedPeriod, "overtime")
          : resultHoursForPeriod(employee, selectedPeriod, "overtime")
        : hasMultipleYears(currentWeek) || hasMultipleMonths(currentWeek)
        ? resultHoursForPeriods(employee, selectedPeriod, "overtime")
        : resultHoursForPeriod(employee, selectedPeriod, "overtime");
    };

    const modalContent = (employee: Employee) => {
      return (
        <TabContext value={tabValue}>
          <Box sx={{ bgcolor: "background.paper" }}>
            <TabList onChange={handleTabChange} sx={{ padding: 0, margin: 0 }}>
              <Tab label="Semanal" value={0} />
              <Tab label="Quincenal" value={1} />
              <Tab label="Mensual" value={2} />
              <Tab label="Horas Extra" value={3} />
            </TabList>
          </Box>
          <TabPanel value={0} sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <Typography variant="body2">
              {`${employee.firstName} ha trabajado un total de `}
              <strong>
                {resultHoursForPeriod(employee, "weekly", "totalHours")}
              </strong>
              {` horas en la semana número `}
              <strong>{weekNumber}</strong>
              {`, que comprende del ${formatDate(
                new Date(currentWeek[0]?.date),
                false
              )} al ${formatDate(new Date(currentWeek[6]?.date), false)} `}
            </Typography>
          </TabPanel>
          <TabPanel value={1} sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <Typography variant="body2">
              {`${employee.firstName} ha trabajado un total de `}
              <strong>
                {resultHoursForPeriod(employee, "biweekly", "totalHours")}
              </strong>
              {` horas en la quincena número `} <strong>{biweekNumber}</strong>
              {`, que comprende del ${formatDate(
                getBiweeklyDates(year, biweekNumber).startDate,
                false
              )} al ${formatDate(
                getBiweeklyDates(year, biweekNumber).startDate,
                false
              )}`}
            </Typography>
          </TabPanel>
          <TabPanel value={2} sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <Typography variant="body2">
              {`${employee.firstName} ha trabajado un total de `}
              <strong>
                {resultHoursForPeriod(employee, "monthly", "totalHours")}
              </strong>
              {` horas en el mes de ${getMonthName(month)} del ${year}`}
            </Typography>
          </TabPanel>
          <TabPanel value={3} sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <Typography variant="body2">
              {`${employee.firstName} ha trabajado un total de: `}
            </Typography>
            <Typography variant="body2">
              <strong>
                {resultHoursForPeriod(employee, "weekly", "overtime")}
              </strong>
              {` horas extra en la semana número `}
              <strong>{weekNumber}</strong>
              {`, que comprende del ${formatDate(
                new Date(currentWeek[0]?.date),
                false
              )} al ${formatDate(new Date(currentWeek[6]?.date), false)} `}
            </Typography>
            <Typography variant="body2">
              <strong>
                {resultHoursForPeriod(employee, "biweekly", "overtime")}
              </strong>
              {` horas extra en la quincena número `}{" "}
              <strong>{biweekNumber}</strong>
              {`, que comprende del ${formatDate(
                getBiweeklyDates(year, biweekNumber).startDate,
                false
              )} al ${formatDate(
                getBiweeklyDates(year, biweekNumber).startDate,
                false
              )}`}
            </Typography>
            <Typography variant="body2">
              <strong>
                {resultHoursForPeriod(employee, "monthly", "overtime")}
              </strong>
              {` horas extra en el mes de ${getMonthName(month)} del ${year}`}
            </Typography>
          </TabPanel>
        </TabContext>
      );
    };

    return (
      <Paper sx={{ width: "100%" }}>
        <TableContainer
          className="table-container"
          sx={{ maxHeight: "65vh", overflowX: "auto" }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 3,
                }}
              >
                <TableCell align="center" colSpan={9}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
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
                          <Typography variant="body2">{`Quincenas ${multiplePeriods.biweekNumbers[0].biweekNumber} / ${multiplePeriods.biweekNumbers[1].biweekNumber}`}</Typography>
                        ) : (
                          <Typography variant="body2">{`Quincena ${biweekNumber}`}</Typography>
                        )}
                      </div>
                    ) : (
                      <div>
                        {hasMultipleMonths(currentWeek) ? (
                          <Typography variant="body2">{`${getMonthName(
                            multiplePeriods.months[0].month
                          )} / ${getMonthName(
                            multiplePeriods.months[1].month
                          )}`}</Typography>
                        ) : (
                          <Typography variant="body2">{`${getMonthName(
                            month
                          )}`}</Typography>
                        )}
                      </div>
                    )}
                  </Box>
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
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      zIndex: 3,
                    }}
                  >
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
                    zIndex: 3,
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
                  sx={{
                    backgroundColor: rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                  }}
                >
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      backgroundColor: rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        whiteSpace: isSmallScreen ? "break-spaces" : "nowrap",
                      }}
                    >
                      <Typography variant="body2">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <ModalComponent
                        buttonType="icon"
                        buttonIcon={<InfoRoundedIcon />}
                        modalTitle={`${employee.firstName} ${employee.lastName}`}
                        modalDescription="Resumen del total de horas trabajadas"
                        children={modalContent(employee)}
                      />
                    </Box>
                  </TableCell>
                  {currentWeek.map(({ day, date }) => {
                    const formattedDate = format(new Date(date), "yyyy-MM-dd");
                    const existingRecord = hoursWorked.find(
                      (record) =>
                        record.employeeId === employee.id &&
                        format(new Date(record.date), "yyyy-MM-dd") ===
                          formattedDate
                    );

                    const options = getOptionsForDay(day, schedules);
                    const validLabels = options.map((option) => option.label);

                    const selectedLabel =
                      schedules.find(
                        (schedule) => schedule.id === existingRecord?.scheduleId
                      )?.label ?? STATE.FREE;

                    const finalSelectedLabel = validLabels.includes(
                      selectedLabel
                    )
                      ? selectedLabel
                      : validLabels[0] ?? "";

                    const sortedOptions = [...options].sort((a, b) => {
                      const indexA = DEFAULT_SCHEDULE_VALUES.indexOf(a.label);
                      const indexB = DEFAULT_SCHEDULE_VALUES.indexOf(b.label);

                      if (indexA !== -1 && indexB !== -1)
                        return indexA - indexB;
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
                            onChange={(event: SelectChangeEvent<string>) =>
                              handleChange(event, employee.id, new Date(date))
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
                      backgroundColor: rowIndex % 2 === 0 ? "white" : "#f5f5f5",
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
                          whiteSpace: "nowrap",
                        }}
                      >
                        <strong>{resultTotalHours(employee)}</strong>
                        &nbsp;horas
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", ml: 1 }}
                      >
                        <Tooltip title="Horas Extra" arrow>
                          <Box>
                            <Badge
                              badgeContent={resultOvertime(employee)}
                              max={9999999}
                              color={
                                resultOvertime(employee) === 0 ||
                                resultOvertime(employee) === "0/0"
                                  ? "success"
                                  : "warning"
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
                      getBiweeklyDates(
                        year,
                        multiplePeriods.biweekNumbers[0].biweekNumber
                      ).startDate
                    )} al ${formatDateWithoutYear(
                      getBiweeklyDates(
                        year,
                        multiplePeriods.biweekNumbers[0].biweekNumber
                      ).endDate
                    )} / ${formatDateWithoutYear(
                      getBiweeklyDates(
                        year,
                        multiplePeriods.biweekNumbers[1].biweekNumber
                      ).startDate
                    )} al ${formatDateWithoutYear(
                      getBiweeklyDates(
                        year,
                        multiplePeriods.biweekNumbers[1].biweekNumber
                      ).endDate
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
                      multiplePeriods.months[0].month
                    )} / ${getMonthName(
                      multiplePeriods.months[1].month
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

export default SelectorTable;
