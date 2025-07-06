import React, { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Employee } from "../../../models/Employee";
import { Schedule } from "../../../models/Schedule";
import { HoursWorked } from "../../../models/HoursWorked";
import { WeeklySummary } from "../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../models/MonthlySummary";
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
  TableSortLabel,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  SelectChangeEvent,
  Badge,
  Tooltip,
  Stack,
  OutlinedInput,
  InputAdornment,
  IconButton,
  ListSubheader,
} from "@mui/material";
import PaginationComponent from "../Pagination/Pagination.component";
import {
  formatHeaderDate,
  getCurrentWeekDates,
  getInvolvedPeriods,
} from "../../../utils/dates";
import {
  translateDayToAbrevSpanish,
} from "../../../utils/string";
import { EnglishDayOfWeek } from "../../../utils/dayAbreviations";
import {
  TABLE,
  PERMISSIONS,
  SELECTOR_TABLE,
} from "../../../constants/constants";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import {
  paperStyles,
  stickyHeaderBoxStyles,
  headerFlexBoxStyles,
  tableContainerStyles,
  tableHeadStyles,
  employeeColumnCellStyles,
  tableCellStyles,
  boldTypographyStyles,
  menuItemStyles,
  listSubheaderStyles,
  dividerStyles,
  badgeStyles,
  stackTotalHoursStyles,
  totalHoursTypographyStyles,
  tableRowBackground,
  tableCellBackground,
  employeeCellBoxStyles,
} from "./SelectorTable.styles";

// Import helper functions
import {
  calculateTotalHours,
  calculateOvertime,
  hasWorkedCurrentWeek,
  sortEmployeesByName,
  paginateEmployees,
  generateRowsPerPageOptions,
  renderPeriodHeader,
  renderPeriodFooter,
  getPeriodMessage,
  getScheduleCellData,
  isToday,
  getOvertimeBadgeColor,
  getDialogTitle,
  getCurrentHoursDisplay,
  getTimeAdjustmentError,
  getTimeAdjustmentIconColor,
} from "./helpers";

import AdjustHoursDialog from './AdjustHoursDialog.component';
import WorkedHoursSummaryDialog from './WorkedHoursSummaryDialog.component';

// SelectorTable component displays and manages employee schedules, hours worked, and summary data for different periods (weekly, biweekly, monthly).
// Props:
// - filteredEmployees: list of employees to display
// - schedules: list of schedules for employees
// - hoursWorked: list of hours worked records
// - weeklySummaries, biweeklySummaries, monthlySummaries: summary data for each period
// - weekOffset, weekNumber, biweekNumber, month, year: period info
// - handleChange: handler for schedule changes
// - handleAdjustTime: handler for manual time adjustments
// - permissions: user permissions for actions
// - onInfoClick: handler for info button click
//
// The table supports sorting, pagination, period selection, and responsive design.
// Main logic includes calculating total hours, overtime, and rendering period-based data.

// SelectorTable component for displaying and managing employee schedules and hours
// Props: filteredEmployees, schedules, hoursWorked, summaries, period info, handlers, permissions
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
    date: Date,
  ) => void;
  handleAdjustTime: (
    employeeId: number,
    condition: 'add' | 'subtract',
    timeAdjustment: number,
  ) => void;
  permissions?: string[];
  onInfoClick?: (employee: Employee) => void;
}

const SelectorTableComponent: React.FC<SelectorTableProps> = React.memo(
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
    const navigate = useNavigate();
    const [selectedPeriod, setSelectedPeriod] = useState<
      "weekly" | "biweekly" | "monthly"
    >("weekly");
    const [timeAdjustment, setTimeAdjustment] = useState(0);
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openAdjustDialogEmployee, setOpenAdjustDialogEmployee] =
      useState<Employee | null>(null);
    const [openInfoDialogEmployee, setOpenInfoDialogEmployee] = useState<Employee | null>(null);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableHeadRef = useRef<HTMLTableSectionElement>(null);
    const paginationRef = useRef<HTMLDivElement>(null);

    // Adjusts rows per page based on screen size
    useEffect(() => {
      if (isSmallScreen) {
        setRowsPerPage(5);
      } else {
        setRowsPerPage(25);
      }
    }, [isSmallScreen]);

    useEffect(() => {
      function calculateRowsPerPage() {
        const maxHeight = window.innerHeight * 0.6; // 60vh
        const headHeight = tableHeadRef.current
          ? tableHeadRef.current.getBoundingClientRect().height
          : 56;
        const paginationHeight = paginationRef.current
          ? paginationRef.current.getBoundingClientRect().height
          : 64;
        const extra = 24; // Buffer for borders/margins
        const availableHeight =
          maxHeight - headHeight - paginationHeight - extra;
        const rowHeight = 48;
        let rows = Math.floor(availableHeight / rowHeight);
        rows = Math.max(3, Math.min(100, rows));
        setRowsPerPage(rows);
      }
      // Wait for layout to stabilize
      setTimeout(calculateRowsPerPage, 0);
      window.addEventListener("resize", calculateRowsPerPage);
      return () => window.removeEventListener("resize", calculateRowsPerPage);
    }, [setRowsPerPage]);

    const currentWeek = useMemo(
      () => getCurrentWeekDates(weekOffset),
      [weekOffset],
    );
    const multiplePeriods = getInvolvedPeriods(currentWeek);

    // Use helper functions for employee data processing
    const sortedEmployees = useMemo(() => {
      return sortEmployeesByName(filteredEmployees, orderDirection);
    }, [filteredEmployees, orderDirection]);

    const paginatedEmployees = paginateEmployees(sortedEmployees, page, rowsPerPage);

    // Use helper functions for hours calculations
    const resultTotalHours = (employee: Employee) => {
      return calculateTotalHours(
        employee,
        selectedPeriod,
        currentWeek,
        weekNumber,
        biweekNumber,
        month,
        year,
        weeklySummaries,
        biweeklySummaries,
        monthlySummaries,
        multiplePeriods,
      );
    };

    const resultOvertime = (employee: Employee) => {
      return calculateOvertime(
        employee,
        selectedPeriod,
        currentWeek,
        weekNumber,
        biweekNumber,
        month,
        year,
        weeklySummaries,
        biweeklySummaries,
        monthlySummaries,
        multiplePeriods,
      );
    };

    const hasWorkedCurrentWeekForEmployee = (employee: Employee): boolean => {
      return hasWorkedCurrentWeek(employee, weekNumber, year, weeklySummaries);
    };

    // Use helper function for rows per page options
    const rowsPerPageOptions = generateRowsPerPageOptions(rowsPerPage);

    return (
      <>
        <Paper sx={paperStyles}>
          <Box sx={stickyHeaderBoxStyles(isSmallScreen)}>
            <Box sx={headerFlexBoxStyles}>
              <Typography variant="body2" sx={boldTypographyStyles}>
                {renderPeriodHeader(
                  selectedPeriod,
                  currentWeek,
                  weekNumber,
                  biweekNumber,
                  month,
                  year,
                  multiplePeriods,
                )}
              </Typography>
            </Box>
          </Box>
          <TableContainer
            className="table-container"
            sx={{ ...tableContainerStyles, maxHeight: "60vh" }}
            ref={tableContainerRef}
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead sx={tableHeadStyles} ref={tableHeadRef}>
                <TableRow>
                  <TableCell
                    className="employee-column"
                    sx={employeeColumnCellStyles(isSmallScreen)}
                  >
                    <TableSortLabel
                      direction={orderDirection}
                      onClick={() =>
                        setOrderDirection((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        )
                      }
                    >
                      {SELECTOR_TABLE.EMPLOYEES}
                    </TableSortLabel>
                  </TableCell>
                  {currentWeek.map(({ day, date }) => (
                    <TableCell
                      key={day}
                      align="center"
                      sx={tableCellStyles(isSmallScreen)}
                    >
                      {`${translateDayToAbrevSpanish(
                        day as EnglishDayOfWeek,
                      )} ${formatHeaderDate(date)}`}
                    </TableCell>
                  ))}
                  {permissions?.includes(
                    PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS,
                  ) && (
                    <>
                      <TableCell />
                      <TableCell
                        align="center"
                        sx={tableCellStyles(isSmallScreen)}
                        colSpan={2}
                      >
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: 120,
                            backgroundColor: "#000",
                            borderRadius: 2,
                            ".MuiOutlinedInput-root": {
                              borderRadius: 2,
                              fontWeight: 700,
                              fontSize: "1rem",
                              color: "#fff",
                              backgroundColor: "#000 !important",
                              "& fieldset": {
                                border: "none",
                              },
                            },
                            ".MuiSelect-select": {
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              fontWeight: 700,
                              color: "#fff",
                              backgroundColor: "#000 !important",
                              pl: 0,
                            },
                            ".MuiSvgIcon-root": {
                              color: "#fff",
                            },
                          }}
                        >
                          <Select
                            value={selectedPeriod}
                            onChange={(e) =>
                              setSelectedPeriod(
                                e.target.value as
                                  | "weekly"
                                  | "biweekly"
                                  | "monthly",
                              )
                            }
                            autoWidth
                            label="Total"
                            input={
                              <OutlinedInput
                                label="Total"
                                id="total-period-select"
                                startAdornment={
                                  <InputAdornment position="start">
                                    {selectedPeriod === "weekly" && (
                                      <CalendarTodayIcon
                                        sx={{ color: "#fff", mr: 1 }}
                                      />
                                    )}
                                    {selectedPeriod === "biweekly" && (
                                      <DateRangeIcon
                                        sx={{ color: "#fff", mr: 1 }}
                                      />
                                    )}
                                    {selectedPeriod === "monthly" && (
                                      <CalendarMonthIcon
                                        sx={{ color: "#fff", mr: 1 }}
                                      />
                                    )}
                                  </InputAdornment>
                                }
                                sx={{
                                  color: "#fff",
                                  backgroundColor: "#000 !important",
                                  borderRadius: 2,
                                  fontWeight: 700,
                                  fontSize: "1rem",
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                }}
                              />
                            }
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 320,
                                  overflowY: "auto",
                                },
                              },
                            }}
                            renderValue={(selected) => {
                              if (selected === "weekly")
                                return SELECTOR_TABLE.WEEKLY;
                              if (selected === "biweekly")
                                return SELECTOR_TABLE.BIWEEKLY;
                              if (selected === "monthly")
                                return SELECTOR_TABLE.MONTHLY;
                              return "";
                            }}
                          >
                            <MenuItem
                              value="weekly"
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.98rem",
                                pl: 3,
                                py: 1.2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CalendarTodayIcon
                                sx={{
                                  color: "primary.main",
                                  fontSize: 20,
                                  mr: 1,
                                }}
                              />
                              {SELECTOR_TABLE.WEEKLY}
                            </MenuItem>
                            <MenuItem
                              value="biweekly"
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.98rem",
                                pl: 3,
                                py: 1.2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <DateRangeIcon
                                sx={{
                                  color: "primary.main",
                                  fontSize: 20,
                                  mr: 1,
                                }}
                              />
                              {SELECTOR_TABLE.BIWEEKLY}
                            </MenuItem>
                            <MenuItem
                              value="monthly"
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.98rem",
                                pl: 3,
                                py: 1.2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CalendarMonthIcon
                                sx={{
                                  color: "primary.main",
                                  fontSize: 20,
                                  mr: 1,
                                }}
                              />
                              {SELECTOR_TABLE.MONTHLY}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((employee, rowIndex) => (
                  <TableRow key={employee.id} sx={tableRowBackground(rowIndex)}>
                    <TableCell
                      sx={Object.assign(
                        {},
                        employeeColumnCellStyles(isSmallScreen),
                        tableCellBackground(rowIndex, false),
                      )}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={employeeCellBoxStyles(isSmallScreen)}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={totalHoursTypographyStyles}
                        >
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        {permissions?.includes(
                          PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS,
                        ) && (
                          <Tooltip title="Ver información" arrow>
                            <span>
                              <IconButton
                                size="medium"
                                sx={{
                                  color: "primary.main",
                                  backgroundColor: "transparent",
                                  "&:hover": {
                                    backgroundColor: "primary.lighter",
                                    boxShadow: 1,
                                  },
                                  transition: "background 0.2s",
                                }}
                                onClick={() =>
                                  onInfoClick && onInfoClick(employee)
                                }
                              >
                                <InfoOutlinedIcon fontSize="medium" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    {currentWeek.map(({ day, date }) => {
                      const scheduleData = getScheduleCellData(
                        employee,
                        day,
                        date,
                        schedules,
                        hoursWorked,
                      );

                      return (
                        <TableCell
                          key={day}
                          sx={tableCellBackground(
                            rowIndex,
                            isToday(date),
                          )}
                        >
                          <FormControl fullWidth>
                            <Select
                              value={scheduleData.finalSelectedLabel}
                              onChange={(event: SelectChangeEvent<string>) =>
                                handleChange(event, employee.id, new Date(date))
                              }
                              disabled={
                                !permissions?.includes(
                                  PERMISSIONS.EDIT_EMPLOYEE_ROLES,
                                )
                              }
                              input={
                                <OutlinedInput
                                  notched={false}
                                  label="Ubicación"
                                />
                              }
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 320,
                                    overflowY: "auto",
                                  },
                                },
                              }}
                            >
                              <ListSubheader
                                sx={listSubheaderStyles("primary.main")}
                              >
                                <LocationOnOutlinedIcon
                                  sx={{ mr: 1, color: "primary.main" }}
                                  fontSize="small"
                                />
                                {SELECTOR_TABLE.LOCATIONS}
                              </ListSubheader>
                              {scheduleData.options
                                .filter((option) => !option.specialSchedule)
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((option) => (
                                  <MenuItem
                                    key={option.id}
                                    value={option.label}
                                    sx={menuItemStyles}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              <Divider sx={dividerStyles} />
                              <ListSubheader
                                sx={listSubheaderStyles("warning.main")}
                              >
                                <StarOutlineOutlinedIcon
                                  sx={{ mr: 1, color: "warning.main" }}
                                  fontSize="small"
                                />
                                {SELECTOR_TABLE.SPECIAL_SCHEDULES}
                              </ListSubheader>
                              {scheduleData.options
                                .filter((option) => option.specialSchedule)
                                .sort((a, b) => a.label.localeCompare(b.label))
                                .map((option) => (
                                  <MenuItem
                                    key={option.id}
                                    value={option.label}
                                    sx={menuItemStyles}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              <Divider />
                              {permissions?.includes(
                                PERMISSIONS.CREATE_SCHEDULES,
                              ) && (
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
                                    {SELECTOR_TABLE.OTHER}
                                  </Box>
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </TableCell>
                      );
                    })}
                    {permissions?.includes(
                      PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS,
                    ) && (
                      <>
                        <TableCell
                          align="center"
                          sx={{
                            padding: isSmallScreen ? "8px" : "16px",
                            backgroundColor:
                              rowIndex % 2 === 0 ? "white" : "#f5f5f5",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Tooltip title="Ajustar horas" arrow>
                              <span>
                                <IconButton
                                  size="medium"
                                  disabled={!hasWorkedCurrentWeekForEmployee(employee)}
                                  sx={{
                                    color: hasWorkedCurrentWeekForEmployee(employee)
                                      ? "warning.main"
                                      : "grey.400",
                                    backgroundColor: "transparent",
                                    "&:hover": {
                                      backgroundColor: "warning.lighter",
                                      boxShadow: 1,
                                    },
                                    transition: "background 0.2s",
                                  }}
                                  onClick={() =>
                                    setOpenAdjustDialogEmployee(employee)
                                  }
                                >
                                  <MoreTimeIcon fontSize="medium" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
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
                          <Stack
                            direction="row"
                            spacing={3.5}
                            alignItems="center"
                            justifyContent="center"
                            sx={stackTotalHoursStyles}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={totalHoursTypographyStyles}
                            >
                              {resultTotalHours(employee)}{" "}
                              {SELECTOR_TABLE.HOURS}
                            </Typography>
                            <Tooltip
                              title={SELECTOR_TABLE.OVERTIME_HOURS}
                              arrow
                            >
                              <span>
                                <Badge
                                  badgeContent={resultOvertime(employee)}
                                  max={9999999}
                                  color={getOvertimeBadgeColor(resultOvertime(employee))}
                                  showZero
                                  sx={badgeStyles}
                                >
                                  <AccessTimeRoundedIcon
                                    sx={{ color: "primary.main", fontSize: 28 }}
                                  />
                                </Badge>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {!isSmallScreen && (
              <Typography variant="body2" sx={{ ml: 2 }}>
                {renderPeriodFooter(
                  selectedPeriod,
                  currentWeek,
                  weekNumber,
                  biweekNumber,
                  month,
                  year,
                  multiplePeriods,
                )}
              </Typography>
            )}
            <div ref={paginationRef}>
              <TablePagination
                className="pagination"
                rowsPerPageOptions={rowsPerPageOptions}
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
                ActionsComponent={PaginationComponent}
              />
            </div>
          </Box>
        </Paper>
        {openAdjustDialogEmployee && (
          <AdjustHoursDialog
            open={!!openAdjustDialogEmployee}
            onClose={() => setOpenAdjustDialogEmployee(null)}
            employee={openAdjustDialogEmployee}
            selectedPeriod={selectedPeriod}
            timeAdjustment={timeAdjustment}
            setTimeAdjustment={setTimeAdjustment}
            getDialogTitle={getDialogTitle}
            getPeriodMessage={getPeriodMessage}
            getCurrentHoursDisplay={getCurrentHoursDisplay}
            getTimeAdjustmentError={getTimeAdjustmentError}
            getTimeAdjustmentIconColor={getTimeAdjustmentIconColor}
            handleAdjustTime={handleAdjustTime}
            weekNumber={weekNumber}
            biweekNumber={biweekNumber}
            month={month}
            year={year}
            weeklySummaries={weeklySummaries}
            biweeklySummaries={biweeklySummaries}
            monthlySummaries={monthlySummaries}
          />
        )}
        {openInfoDialogEmployee && (
          <WorkedHoursSummaryDialog
            open={!!openInfoDialogEmployee}
            onClose={() => setOpenInfoDialogEmployee(null)}
            employee={openInfoDialogEmployee}
            selectedPeriod={selectedPeriod}
            getDialogTitle={getDialogTitle}
            getPeriodMessage={getPeriodMessage}
            getCurrentHoursDisplay={getCurrentHoursDisplay}
            weekNumber={weekNumber}
            biweekNumber={biweekNumber}
            month={month}
            year={year}
            weeklySummaries={weeklySummaries}
            biweeklySummaries={biweeklySummaries}
            monthlySummaries={monthlySummaries}
          />
        )}
      </>
    );
  },
);

SelectorTableComponent.displayName = "SelectorTableComponent";

SelectorTableComponent.propTypes = {
  filteredEmployees: PropTypes.array.isRequired,
  schedules: PropTypes.array.isRequired,
  hoursWorked: PropTypes.array.isRequired,
  weeklySummaries: PropTypes.array.isRequired,
  biweeklySummaries: PropTypes.array.isRequired,
  monthlySummaries: PropTypes.array.isRequired,
  weekOffset: PropTypes.number.isRequired,
  weekNumber: PropTypes.number.isRequired,
  biweekNumber: PropTypes.number.isRequired,
  month: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleAdjustTime: PropTypes.func.isRequired,
  permissions: PropTypes.array,
  onInfoClick: PropTypes.func,
};

export default SelectorTableComponent;
