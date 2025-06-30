import React, { useEffect, useMemo, useState } from "react";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
import { format } from "date-fns";
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
  OutlinedInput,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
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
import DialogComponent from '../../Dialog/DialogComponent';

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
  onInfoClick?: (employee: Employee) => void;
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
    onInfoClick,
  }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<
      "weekly" | "biweekly" | "monthly"
    >("weekly");
    const [tabValue, setTabValue] = React.useState('0');
    const [timeAdjustment, setTimeAdjustment] = useState(0);
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openAdjustDialogEmployee, setOpenAdjustDialogEmployee] = useState<Employee | null>(null);

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

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setTabValue(newValue);
    };

    const hasWorkedCurrentWeek = (employee: Employee): boolean => {
      const found = weeklySummaries.some(
        (summary) =>
          summary.employeeId === employee.id &&
          summary.weekNumber === weekNumber &&
          summary.year === year
      );
      return found;
    };

    const modalContentEditTime = (
      employee: Employee,
      handleClose: () => void
    ) => {
      return (
        <Box sx={{ width: '100%', maxWidth: 900, minHeight: 220, maxHeight: { xs: '80vh', sm: 600 }, overflowY: 'auto', p: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: { xs: 0, sm: 0 }, pt: 0, pb: 2 }}>
            {selectedPeriod === "weekly" ? (
              <Typography variant="body1" mb={2}>
                <strong>Total de horas trabajadas en la semana:</strong>{' '}
                <Typography variant="h5" color="primary" fontWeight={700} component="span" sx={{ ml: 1 }}>{resultHoursForPeriod(employee, "weekly", "totalHours")}</Typography>
              </Typography>
            ) : selectedPeriod === "biweekly" ? (
              <Typography variant="body1" mb={2}>
                <strong>Total de horas trabajadas en la quincena:</strong>{' '}
                <Typography variant="h5" color="primary" fontWeight={700} component="span" sx={{ ml: 1 }}>{resultHoursForPeriod(employee, "biweekly", "totalHours")}</Typography>
              </Typography>
            ) : (
              <Typography variant="body1" mb={2}>
                <strong>Total de horas trabajadas en el mes:</strong>{' '}
                <Typography variant="h5" color="primary" fontWeight={700} component="span" sx={{ ml: 1 }}>{resultHoursForPeriod(employee, "monthly", "totalHours")}</Typography>
              </Typography>
            )}
            <TextField
              label="Horas a ajustar"
              variant="outlined"
              type="number"
              placeholder="0"
              onChange={(e) => setTimeAdjustment(Number(e.target.value))}
              sx={{ mt: 1, maxWidth: 200 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ height: "48px", minWidth: 120, fontWeight: 700, borderRadius: 2, px: 4, boxShadow: 1 }}
                onClick={() => {
                  handleAdjustTime(employee.id, "sum", timeAdjustment);
                  handleClose();
                }}
                disabled={timeAdjustment <= 0}
              >
                Sumar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ height: "48px", minWidth: 120, fontWeight: 700, borderRadius: 2, px: 4, boxShadow: 1 }}
                onClick={() => {
                  handleAdjustTime(employee.id, "substract", timeAdjustment);
                  handleClose();
                }}
                disabled={timeAdjustment <= 0}
              >
                Restar
              </Button>
              <Button onClick={handleClose} variant="text" color="primary" size="large" sx={{ fontWeight: 500, borderRadius: 2, px: 3, py: 1.2 }}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      );
    };

    return (
      <>
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
                          backgroundColor: "#000000",
                        }}
                        colSpan={2}
                      >
                        <FormControl size="small" sx={{
                          '&.MuiFormControl-root': {
                            backgroundColor: "transparent !important",
                          },
                          '& .MuiFormControl-root': {
                            backgroundColor: "transparent !important",
                          },
                          '&.Mui-focused': {
                            backgroundColor: "transparent !important",
                          },
                          '& .Mui-focused': {
                            backgroundColor: "transparent !important",
                          },
                        }}>
                          <InputLabel sx={{ 
                            color: "#9e9e9e", 
                            fontWeight: 600,
                            '&.MuiInputLabel-shrink': {
                              color: "#9e9e9e",
                            },
                            '&.Mui-focused': {
                              color: "#9e9e9e",
                            },
                          }}>
                            Total
                          </InputLabel>
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
                            input={
                              <OutlinedInput
                                label="Total"
                                startAdornment={
                                  <InputAdornment position="start">
                                    {/* CalendarMonthOutlinedIcon */}
                                  </InputAdornment>
                                }
                                sx={{
                                  backgroundColor: 'transparent',
                                  border: 'none !important',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none !important',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    border: 'none !important',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    border: 'none !important',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: "transparent !important",
                                    color: "#ffffff",
                                  },
                                  '&.Mui-active .MuiOutlinedInput-notchedOutline': {
                                    border: 'none !important',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-input': {
                                    backgroundColor: "transparent !important",
                                    color: "#ffffff !important",
                                  },
                                  '&.Mui-focused .MuiSelect-select': {
                                    backgroundColor: "transparent !important",
                                    color: "#ffffff !important",
                                  },
                                  '& .MuiOutlinedInput-input': {
                                    backgroundColor: "transparent !important",
                                    color: "#ffffff !important",
                                  },
                                  '& .MuiSelect-select': {
                                    backgroundColor: "transparent !important",
                                    color: "#ffffff !important",
                                  },
                                }}
                              />
                            }
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  backgroundColor: theme.palette.background.paper,
                                  color: theme.palette.text.primary,
                                  border: "none",
                                  borderRadius: '8px',
                                  boxShadow: theme.shadows[8],
                                  '& .MuiMenuItem-root': {
                                    color: theme.palette.text.primary,
                                    '&:hover': {
                                      backgroundColor: theme.palette.action.hover,
                                    },
                                    '&.Mui-selected': {
                                      backgroundColor: theme.palette.primary.main,
                                      color: theme.palette.primary.contrastText,
                                      '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                      },
                                    },
                                  },
                                },
                              },
                            }}
                            sx={{
                              backgroundColor: 'transparent',
                              border: 'none !important',
                              '& .MuiSelect-select': {
                                backgroundColor: 'transparent',
                                color: "#ffffff",
                                fontWeight: 600,
                                border: 'none !important',
                                '&:focus': {
                                  backgroundColor: 'transparent',
                                  color: "#ffffff",
                                  border: 'none !important',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: "#9e9e9e",
                                fontWeight: 600,
                                '&.Mui-focused': {
                                  color: "#9e9e9e",
                                },
                                '&.MuiInputLabel-shrink': {
                                  color: "#9e9e9e",
                                  transform: 'translate(14px, -9px) scale(0.75)',
                                },
                              },
                              '& .MuiSvgIcon-root': {
                                color: "#ffffff",
                              },
                              '&:hover .MuiSelect-select': {
                                backgroundColor: 'transparent',
                                color: "#ffffff",
                                border: 'none !important',
                              },
                              '&.Mui-focused .MuiSelect-select': {
                                backgroundColor: 'transparent',
                                color: "#ffffff",
                                border: 'none !important',
                              },
                              '& .MuiOutlinedInput-root': {
                                border: 'none !important',
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none !important',
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
                          <IconButton onClick={() => onInfoClick && onInfoClick(employee)}>
                            <InfoOutlinedIcon />
                          </IconButton>
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
                                : rowIndex % 2 === 0 ? "white" : "#f5f5f5",
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
                                  >
                                    <Box
                                      display="flex"
                                      justifyContent="space-between"
                                      width="100%"
                                      alignItems="center"
                                    >
                                      Otro
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
                            backgroundColor: rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                          }}
                        >
                          <IconButton
                            onClick={() => setOpenAdjustDialogEmployee(employee)}
                            disabled={!hasWorkedCurrentWeek(employee)}
                            sx={{
                              color: hasWorkedCurrentWeek(employee) ? '#000' : '#ccc',
                              backgroundColor: 'transparent',
                              borderRadius: '50%',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.04)',
                              },
                              width: 40,
                              height: 40,
                            }}
                          >
                            <MoreTimeIcon />
                          </IconButton>
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
        {openAdjustDialogEmployee && (
          <DialogComponent
            open={!!openAdjustDialogEmployee}
            onClose={() => setOpenAdjustDialogEmployee(null)}
            icon={<MoreTimeIcon color="primary" sx={{ fontSize: 28 }} />}
            title="Ajuste de Horas"
            subtitle={`${openAdjustDialogEmployee.firstName} ${openAdjustDialogEmployee.lastName}`}
            hideActions
            paperSx={{ maxWidth: 600 }}
          >
            {modalContentEditTime(openAdjustDialogEmployee, () => setOpenAdjustDialogEmployee(null))}
          </DialogComponent>
        )}
      </>
    );
  }
);

export default SelectorTable;
