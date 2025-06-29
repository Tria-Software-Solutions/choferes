import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Card,
  CardContent,
  Alert,
  InputAdornment,
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
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WarningIcon from "@mui/icons-material/Warning";

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
    const [tabValue, setTabValue] = useState("0");
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
    
    const multiplePeriods = useMemo(
      () => getInvolvedPeriods(currentWeek),
      [currentWeek]
    );

    const sortedEmployees = useMemo(() => {
      return [...filteredEmployees].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
      });
    }, [filteredEmployees]);

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedEmployees = useMemo(
      () => sortedEmployees.slice(startIndex, endIndex),
      [sortedEmployees, startIndex, endIndex]
    );

    const resultHoursForPeriod = useCallback((
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
    }, [weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries]);

    const resultHoursForPeriods = useCallback((
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
    }, [multiplePeriods, weeklySummaries, biweeklySummaries, monthlySummaries]);

    const resultTotalHours = useCallback((employee: Employee) => {
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
    }, [selectedPeriod, currentWeek, resultHoursForPeriod, resultHoursForPeriods]);

    const resultOvertime = useCallback((employee: Employee) => {
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
    }, [selectedPeriod, currentWeek, resultHoursForPeriod, resultHoursForPeriods]);

    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue.toString());
    }, []);

    const hasWorkedCurrentWeek = useCallback((employee: Employee): boolean => {
      const found = weeklySummaries.some(
        (summary) =>
          summary.employeeId === employee.id &&
          summary.weekNumber === weekNumber &&
          summary.year === year
      );
      return found;
    }, [weeklySummaries, weekNumber, year]);

    const modalContentSummary = (employee: Employee) => {
      return (
        <Box sx={{ width: '100%' }}>
          {/* Header con información del empleado */}
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3,
              borderColor: 'primary.main',
              backgroundColor: 'primary.50'
            }}
          >
            <CardContent sx={{ py: 2, px: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <AssessmentIcon color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Resumen Detallado de Horas Trabajadas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <TabContext value={tabValue}>
            <Box
              sx={{
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2
              }}
            >
              <TabList 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    minHeight: 48,
                  }
                }}
              >
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon fontSize="small" />
                      Semanal
                    </Box>
                  } 
                  value="0" 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarMonthIcon fontSize="small" />
                      Quincenal
                    </Box>
                  } 
                  value="1" 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarMonthIcon fontSize="small" />
                      Mensual
                    </Box>
                  } 
                  value="2" 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <WarningIcon fontSize="small" />
                      Horas Extra
                    </Box>
                  } 
                  value="3" 
                />
              </TabList>
            </Box>
            
            <TabPanel
              value="0"
              sx={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 2,
              }}
            >
              <Card variant="outlined">
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Resumen Semanal - Semana {weekNumber}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Empleado</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                            Horas Trabajadas
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Semana</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
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
                            <Typography variant="h6" fontWeight={700} color="primary">
                              {resultHoursForPeriod(employee, "weekly", "totalHours")}
                            </Typography>
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
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value="1" sx={{ paddingLeft: 0, paddingRight: 0, paddingTop: 2 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Resumen Quincenal - Quincena {biweekNumber}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Empleado</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                            Horas Trabajadas
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Quincena</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
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
                            <Typography variant="h6" fontWeight={700} color="primary">
                              {resultHoursForPeriod(
                                employee,
                                "biweekly",
                                "totalHours"
                              )}
                            </Typography>
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
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value="2" sx={{ paddingLeft: 0, paddingRight: 0, paddingTop: 2 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Resumen Mensual - {getMonthName(month)} {year}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Empleado</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                            Horas Trabajadas
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Mes</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Año</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {employee.firstName} {employee.lastName}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="h6" fontWeight={700} color="primary">
                              {resultHoursForPeriod(
                                employee,
                                "monthly",
                                "totalHours"
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{getMonthName(month)}</TableCell>
                          <TableCell align="center">{year}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value="3" sx={{ paddingLeft: 0, paddingRight: 0, paddingTop: 2 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, backgroundColor: 'warning.50', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={600} color="warning.main">
                      Horas Extra Acumuladas
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Empleado</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Periodo</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                            Horas Extra
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Número</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
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
                            <Typography variant="h6" fontWeight={700} color="warning.main">
                              {resultHoursForPeriod(employee, "weekly", "overtime")}
                            </Typography>
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
                            <Typography variant="h6" fontWeight={700} color="warning.main">
                              {resultHoursForPeriod(employee, "biweekly", "overtime")}
                            </Typography>
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
                            <Typography variant="h6" fontWeight={700} color="warning.main">
                              {resultHoursForPeriod(employee, "monthly", "overtime")}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{getMonthName(month)}</TableCell>
                          <TableCell align="center">{year}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </TabPanel>
          </TabContext>
        </Box>
      );
    };

    const modalContentEditTime = (
      employee: Employee,
      handleClose: () => void
    ) => {
      const currentHours = resultHoursForPeriod(employee, selectedPeriod, "totalHours");
      const periodText = selectedPeriod === "weekly" 
        ? "semana" 
        : selectedPeriod === "biweekly" 
        ? "quincena" 
        : "mes";
      
      const periodNumber = selectedPeriod === "weekly" 
        ? weekNumber 
        : selectedPeriod === "biweekly" 
        ? biweekNumber 
        : getMonthName(month);

      return (
        <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
          {/* Información del empleado */}
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3,
              borderColor: 'primary.main',
              backgroundColor: 'primary.50'
            }}
          >
            <CardContent sx={{ py: 2, px: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <PersonIcon color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Empleado
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Información actual de horas */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ py: 2, px: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AccessTimeIcon color="info" sx={{ fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600}>
                  Horas Actuales
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Total de horas trabajadas en la {periodText} {periodNumber}:
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary" sx={{ textAlign: 'center' }}>
                {currentHours} horas
              </Typography>
            </CardContent>
          </Card>

          {/* Campo de ajuste */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ py: 2, px: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Ajuste de Horas
              </Typography>
              <TextField
                fullWidth
                label="Cantidad de horas a ajustar"
                variant="outlined"
                type="number"
                placeholder="0"
                value={timeAdjustment || ''}
                onChange={(e) => setTimeAdjustment(Number(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon color="action" />
                    </InputAdornment>
                  ),
                  inputProps: { 
                    min: 0,
                    step: 0.5
                  }
                }}
                helperText="Ingresa la cantidad de horas que deseas sumar o restar"
                sx={{ mb: 2 }}
              />
              
              {timeAdjustment > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Nuevo total:</strong> {currentHours + timeAdjustment} horas
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<TrendingUpIcon />}
              onClick={() => {
                handleAdjustTime(employee.id, "sum", timeAdjustment);
                handleClose();
              }}
              disabled={timeAdjustment <= 0}
              sx={{
                minWidth: 140,
                py: 1.5,
                px: 3,
                fontWeight: 600,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              Sumar Horas
            </Button>
            
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<TrendingDownIcon />}
              onClick={() => {
                handleAdjustTime(employee.id, "substract", timeAdjustment);
                handleClose();
              }}
              disabled={timeAdjustment <= 0}
              sx={{
                minWidth: 140,
                py: 1.5,
                px: 3,
                fontWeight: 600,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              Restar Horas
            </Button>
          </Box>
        </Box>
      );
    };

    return (
      <Paper sx={{ width: "100%" }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            backgroundColor: "#f0f2f5",
            padding: isSmallScreen ? "8px" : "16px",
            borderBottom: "1px solid #ddd",
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
                  <Typography variant="body2" fontWeight="bold">
                    {`Semanas ${multiplePeriods.weekNumbers[1].weekNumber} / `}
                    {multiplePeriods.weekNumbers[0].weekNumber}
                  </Typography>
                ) : (
                  <Typography variant="body2" fontWeight="bold">{`Semana ${weekNumber}`}</Typography>
                )}
              </div>
            ) : selectedPeriod === "biweekly" ? (
              <div>
                {hasMultipleBiweeks(currentWeek) ? (
                  <Typography variant="body2" fontWeight="bold">
                    {`Quincenas ${multiplePeriods.biweekNumbers[0].biweekNumber} / `}
                    {multiplePeriods.biweekNumbers[1].biweekNumber}
                  </Typography>
                ) : (
                  <Typography variant="body2" fontWeight="bold">{`Quincena ${biweekNumber}`}</Typography>
                )}
              </div>
            ) : (
              <div>
                {hasMultipleMonths(currentWeek) ? (
                  <Typography variant="body2" fontWeight="bold">{`${getMonthName(
                    multiplePeriods.months[0].month
                  )} / ${getMonthName(
                    multiplePeriods.months[1].month
                  )}`}</Typography>
                ) : (
                  <Typography variant="body2" fontWeight="bold">{`${getMonthName(
                    month
                  )}`}</Typography>
                )}
              </div>
            )}
          </Box>
        </Box>
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
                  className="employee-column"
                  sx={{
                    padding: isSmallScreen ? "8px" : "16px",
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
                      padding: isSmallScreen ? "8px" : "16px",
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
                        padding: isSmallScreen ? "8px" : "16px",
                        position: isSmallScreen ? "static" : "sticky",
                        right: 0,
                        zIndex: 3,
                      }}
                      colSpan={2}
                    >
                      <FormControl>
                        <InputLabel sx={{ 
                          color: '#ffffff !important',
                          '&.Mui-focused': {
                            color: '#ffffff !important',
                          },
                          '&.Mui-focused.MuiInputLabel-shrink': {
                            color: '#ffffff !important',
                          }
                        }}>Total</InputLabel>
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
                          sx={{
                            color: '#ffffff',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#ffffff !important',
                              borderWidth: '2px !important',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#ffffff !important',
                              borderWidth: '2px !important',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#ffffff !important',
                              borderWidth: '2px !important',
                            },
                            '&.Mui-focused:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#ffffff !important',
                              borderWidth: '2px !important',
                            },
                            '& .MuiSelect-select': {
                              color: '#ffffff',
                            },
                            '& .MuiSelect-icon': {
                              color: '#ffffff',
                            },
                          }}
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
                      padding: isSmallScreen ? "8px" : "16px",
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
                          modalStyle={{ width: "90%", maxWidth: 1000 }}
                          modalTooltip="Resumen de Horas Trabajadas"
                          modalTitle="Resumen de Horas Trabajadas"
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
                          padding: isSmallScreen ? "8px" : "16px",
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
                      <TableCell
                        align="center"
                        sx={{
                          padding: isSmallScreen ? "8px" : "16px",
                        }}
                      >
                        <ModalComponent
                          buttonType="button"
                          buttonIcon={<MoreTimeIcon />}
                          variant="contained"
                          buttonStyle={{ height: "56px" }}
                          modalStyle={{ width: isSmallScreen ? "80%" : "40%" }}
                          disabled={!hasWorkedCurrentWeek(employee)}
                          modalTooltip="Ajuste de Horas"
                          modalTitle="Ajuste de Horas"
                        >
                          {({ handleClose }) =>
                            modalContentEditTime(employee, handleClose)
                          }
                        </ModalComponent>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: isSmallScreen ? "8px" : "16px",
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
