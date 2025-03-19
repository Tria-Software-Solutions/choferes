import React, { useEffect, useMemo, useState } from "react";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ModalComponent from "../../Modal/ModalComponent";
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
  TextField,
  Button,
  ListSubheader,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import PaginationActions from "../Pagination/PaginationActions";
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
} from "../../../utils/dates";
import {
  getMonthName,
  getOptionsForDay,
  translateDayToAbrevSpanish,
} from "../../../utils/string";
import {
  calculateTotalHoursAndOvertimeForPeriod,
  calculateTotalHoursAndOvertimeForPeriods,
} from "../../../utils/calculation";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import { STATE, TABLE, PERMISSIONS } from "../../../constants/constants";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

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
  handleAdjustTime: (
    employeeId: number,
    condition: string,
    timeAdjustment: number
  ) => void;
  permissions?: string[];
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
    handleAdjustTime,
    permissions,
  }) => {
    const navigate = useNavigate();
    const [selectedPeriod, setSelectedPeriod] = useState<
      "weekly" | "biweekly" | "monthly"
    >("weekly");
    const [tabValue, setTabValue] = React.useState(0);
    const [timeAdjustment, setTimeAdjustment] = useState(0);
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
      if (isSmallScreen) {
        setRowsPerPage(5);
      } else {
        setRowsPerPage(25);
      }
    }, [isSmallScreen]);

    const currentWeek = useMemo(
      () => getCurrentWeekDates(weekOffset),
      [weekOffset]
    );
    const multiplePeriods = getInvolvedPeriods(currentWeek);

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

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    };

    const hasWorkedCurrentWeek = (employee: Employee): boolean => {
      const found = weeklySummaries.some(
        (summary) =>
          summary.employeeId === employee.id &&
          summary.weekNumber === weekNumber &&
          summary.month === month &&
          summary.year === year
      );
      return found;
    };

    const modalContentSummary = (employee: Employee) => {
      return (
        <TabContext value={tabValue}>
          <Box
            sx={{
              bgcolor: "background.paper",
            }}
          >
            <TabList onChange={handleTabChange}>
              <Tab label="Semanal" value={0} />
              <Tab label="Quincenal" value={1} />
              <Tab label="Mensual" value={2} />
              <Tab label="Horas Extra" value={3} />
            </TabList>
          </Box>
          <TabPanel
            value={0}
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      Horas Trabajadas
                    </TableCell>
                    <TableCell align="center">Semana</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      Rango de Fechas
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell align="center">
                      <strong>
                        {resultHoursForPeriod(employee, "weekly", "totalHours")}
                      </strong>
                    </TableCell>
                    <TableCell align="center">{weekNumber}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {`${formatDate(
                        new Date(currentWeek[0]?.date),
                        false
                      )} - ${formatDate(
                        new Date(currentWeek[6]?.date),
                        false
                      )}`}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel value={1} sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      Horas Trabajadas
                    </TableCell>
                    <TableCell align="center">Quincena</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      Rango de Fechas
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell align="center">
                      <strong>
                        {resultHoursForPeriod(
                          employee,
                          "biweekly",
                          "totalHours"
                        )}
                      </strong>
                    </TableCell>
                    <TableCell align="center">{biweekNumber}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {`${formatDate(
                        getBiweeklyDates(year, biweekNumber).startDate,
                        false
                      )} -  ${formatDate(
                        getBiweeklyDates(year, biweekNumber).endDate,
                        false
                      )}`}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel value={2} sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      Horas Trabajadas
                    </TableCell>
                    <TableCell align="center">Mes</TableCell>
                    <TableCell align="center">Año</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell align="center">
                      <strong>
                        {resultHoursForPeriod(
                          employee,
                          "monthly",
                          "totalHours"
                        )}
                      </strong>
                    </TableCell>
                    <TableCell align="center">{getMonthName(month)}</TableCell>
                    <TableCell align="center">{year}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
          <TabPanel value={3} sx={{ paddingLeft: 0, paddingRight: 0 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell align="center">Periodo</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      Horas Extra
                    </TableCell>
                    <TableCell align="center">Número</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      Rango de Fechas
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell rowSpan={3} sx={{ whiteSpace: "nowrap" }}>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell align="center">Semanal</TableCell>
                    <TableCell align="center">
                      <strong>
                        {resultHoursForPeriod(employee, "weekly", "overtime")}
                      </strong>
                    </TableCell>
                    <TableCell align="center">{weekNumber}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {`${formatDate(
                        new Date(currentWeek[0]?.date),
                        false
                      )} - ${formatDate(
                        new Date(currentWeek[6]?.date),
                        false
                      )}`}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">Quincenal</TableCell>
                    <TableCell align="center">
                      <strong>
                        {resultHoursForPeriod(employee, "biweekly", "overtime")}
                      </strong>
                    </TableCell>
                    <TableCell align="center">{biweekNumber}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      {`${formatDate(
                        getBiweeklyDates(year, biweekNumber).startDate,
                        false
                      )} - ${formatDate(
                        getBiweeklyDates(year, biweekNumber).endDate,
                        false
                      )}`}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center">Mensual</TableCell>
                    <TableCell align="center">
                      <strong>
                        {resultHoursForPeriod(employee, "monthly", "overtime")}
                      </strong>
                    </TableCell>
                    <TableCell align="center">{getMonthName(month)}</TableCell>
                    <TableCell align="center">{year}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabContext>
      );
    };

    const modalContentEditTime = (
      employee: Employee,
      handleClose: () => void
    ) => {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            margin: "auto",
          }}
        >
          {selectedPeriod === "weekly" ? (
            <Typography variant="body1">
              <strong>Total de horas trabajadas en la semana:</strong>{" "}
              {resultHoursForPeriod(employee, "weekly", "totalHours")} horas
            </Typography>
          ) : selectedPeriod === "biweekly" ? (
            <Typography variant="body1">
              <strong>Total de horas trabajadas en la quincena:</strong>{" "}
              {resultHoursForPeriod(employee, "biweekly", "totalHours")} horas
            </Typography>
          ) : (
            <Typography variant="body1">
              <strong>Total de horas trabajadas en el mes:</strong>{" "}
              {resultHoursForPeriod(employee, "monthly", "totalHours")} horas
            </Typography>
          )}
          <TextField
            label="Horas a ajustar"
            variant="outlined"
            type="number"
            placeholder="0"
            onChange={(e) => setTimeAdjustment(Number(e.target.value))}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Tooltip title="Sumar Horas" arrow>
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ height: "56px" }}
                  onClick={() => {
                    handleAdjustTime(employee.id, "sum", timeAdjustment);
                    handleClose();
                  }}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Tooltip>

            <Tooltip title="Restar Horas" arrow>
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ height: "56px" }}
                  onClick={() => {
                    handleAdjustTime(employee.id, "substract", timeAdjustment);
                    handleClose();
                  }}
                >
                  <RemoveIcon />
                </Button>
              </Box>
            </Tooltip>
          </Box>
        </Box>
      );
    };

    return (
      <Paper sx={{ width: "100%" }}>
        <TableContainer
          className="table-container"
          sx={{ maxHeight: "65vh", overflowX: "auto" }}
        >
          <Table stickyHeader aria-label="sticky table">
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 4,
              }}
            >
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={10}
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 4,
                  }}
                >
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
                          <Typography variant="body2">
                            {`Semanas ${multiplePeriods.weekNumbers[1].weekNumber} / `}
                            {multiplePeriods.weekNumbers[0].weekNumber}
                          </Typography>
                        ) : (
                          <Typography variant="body2">{`Semana ${weekNumber}`}</Typography>
                        )}
                      </div>
                    ) : selectedPeriod === "biweekly" ? (
                      <div>
                        {hasMultipleBiweeks(currentWeek) ? (
                          <Typography variant="body2">
                            {`Quincenas ${multiplePeriods.biweekNumbers[0].biweekNumber} / `}
                            {multiplePeriods.biweekNumbers[1].biweekNumber}
                          </Typography>
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
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 4,
                  }}
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
                {permissions?.includes(
                  PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                ) && (
                  <>
                    <TableCell />
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
                              e.target.value as
                                | "weekly"
                                | "biweekly"
                                | "monthly"
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
                  </>
                )}
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
                      {permissions?.includes(
                        PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                      ) && (
                        <ModalComponent
                          buttonType="icon"
                          buttonIcon={<InfoOutlinedIcon />}
                          variant="text"
                          modalStyle={{ width: "80%" }}
                          modalTitle={"Resumen de Horas Trabajadas"}
                          modalDescription="Detalle de horas trabajadas en los diferentes períodos"
                          children={({ handleClose }) =>
                            modalContentSummary(employee)
                          }
                        />
                      )}
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
                            disabled={
                              !permissions?.includes(
                                PERMISSIONS.EDIT_EMPLOYEE_ROLES
                              )
                            }
                          >
                            <ListSubheader>
                              <strong>Ubicaciones</strong>
                            </ListSubheader>
                            {options
                              .filter((option) => !option.specialSchedule)
                              .sort((a, b) => a.label.localeCompare(b.label))
                              .map((option) => (
                                <MenuItem key={option.id} value={option.label}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            <Divider />
                            <ListSubheader>
                              <strong>Horarios Especiales</strong>
                            </ListSubheader>
                            {options
                              .filter((option) => option.specialSchedule)
                              .sort((a, b) => a.label.localeCompare(b.label))
                              .map((option) => (
                                <MenuItem key={option.id} value={option.label}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            <Divider />
                            {permissions?.includes(
                              PERMISSIONS.CREATE_SCHEDULES
                            ) && (
                              <>
                                <MenuItem
                                  value={"Other"}
                                  onClick={() => navigate("/schedules")}
                                >
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    width="100%"
                                    alignItems="center"
                                  >
                                    Otro
                                    <AddIcon fontSize="small" />
                                  </Box>
                                </MenuItem>
                              </>
                            )}
                          </Select>
                        </FormControl>
                      </TableCell>
                    );
                  })}
                  {permissions?.includes(
                    PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS
                  ) && (
                    <>
                      <TableCell align="center">
                        <ModalComponent
                          buttonType="button"
                          buttonIcon={<MoreTimeIcon />}
                          variant="contained"
                          buttonStyle={{ height: "56px" }}
                          modalStyle={{ width: isSmallScreen ? "80%" : "40%" }}
                          disabled={!hasWorkedCurrentWeek(employee)}
                          modalTitle={"Ajuste de Horas"}
                          modalDescription={`Ingresa la cantidad de horas que deseas sumar o restar al total de horas trabajadas por ${employee.firstName} ${employee.lastName}.`}
                        >
                          {({ handleClose }) =>
                            modalContentEditTime(employee, handleClose)
                          }
                        </ModalComponent>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          position: isSmallScreen ? "static" : "sticky",
                          right: 0,
                          zIndex: 2,
                          backgroundColor:
                            rowIndex % 2 === 0 ? "white" : "#f5f5f5",
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              ml: 1,
                            }}
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
                    </>
                  )}
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
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={sortedEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={
              <Typography variant="body2" component="span">
                {TABLE.ROWS_PER_PAGE}
              </Typography>
            }
            labelDisplayedRows={() => ""}
            ActionsComponent={PaginationActions}
          />
        </Box>
      </Paper>
    );
  }
);

export default SelectorTable;
