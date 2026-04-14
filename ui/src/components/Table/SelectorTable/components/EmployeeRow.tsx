import React, { memo, useCallback } from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  IconButton,
  Stack,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
  type SelectChangeEvent,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import PersonIcon from "@mui/icons-material/Person";
import type { Employee } from "../../../../models/Employee";
import type { Schedule } from "../../../../models/Schedule";
import type { DayEntry } from "../../../../utils/dates";
import { SELECTOR_TABLE, PERMISSIONS } from "../../../../constants/constants";
import PremiumTooltip from "../../../../components/PremiumTooltip/PremiumTooltip.component";
import { getScheduleCellData, isToday } from "../helpers/scheduleCell";
import { getEmployeeRowStyles } from "../styles/employeeRow.styles";
import { premiumSelectorMenuProps } from "../SelectorTable.styles";

interface EmployeeRowProps {
  employee: Employee;
  rowIndex: number;
  currentWeek: DayEntry[];
  schedules: Schedule[];
  hoursWorked: import("../../../../models/HoursWorked").HoursWorked[];
  totalHours: number;
  overtime: number;
  hasWorked: boolean;
  isSmallScreen: boolean;
  permissions?: string[];
  onInfoClick: (employee: Employee) => void;
  onAdjustClick: (employee: Employee) => void;
  onScheduleChange: (
    event: SelectChangeEvent<string>,
    employeeId: number,
    date: Date
  ) => void;
  theme: import("@mui/material").Theme;
}

export const EmployeeRow = memo(function EmployeeRow({
  employee,
  rowIndex,
  currentWeek,
  schedules,
  hoursWorked,
  totalHours,
  overtime,
  hasWorked,
  isSmallScreen,
  permissions,
  onInfoClick,
  onAdjustClick,
  onScheduleChange,
  theme,
}: EmployeeRowProps) {
  const styles = getEmployeeRowStyles(theme, isSmallScreen, rowIndex);
  const showHoursColumn = permissions?.includes(PERMISSIONS.VIEW_EMPLOYEE_ROLES_HOURS);

  const handleInfoClick = useCallback(() => {
    onInfoClick(employee);
  }, [employee, onInfoClick]);

  const handleAdjustClick = useCallback(() => {
    onAdjustClick(employee);
  }, [employee, onAdjustClick]);

  return (
    <TableRow sx={styles.row}>
      {/* Employee name cell */}
      <TableCell sx={styles.employeeCell}>
        <Box sx={styles.employeeBox}>
          <Typography variant="body2" fontWeight={600} sx={styles.employeeName}>
            {employee.firstName} {employee.lastName}
          </Typography>
          {showHoursColumn && (
            <PremiumTooltip title="Ver información">
              <span>
                <IconButton
                  size="small"
                  sx={styles.infoButton}
                  onClick={handleInfoClick}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </PremiumTooltip>
          )}
        </Box>
      </TableCell>

      {/* Schedule cells for each day */}
      {currentWeek.map(({ day, date }) => {
        const cellData = getScheduleCellData(employee, day, date, schedules, hoursWorked);
        const today = isToday(date);

        return (
          <TableCell key={day} sx={styles.scheduleCell(today)}>
            <FormControl fullWidth size="small">
              <Select
                value={cellData.finalSelectedLabel}
                onChange={(e) => onScheduleChange(e, employee.id, new Date(date))}
                input={<OutlinedInput notched={false} />}
                sx={styles.select}
                MenuProps={premiumSelectorMenuProps}
                renderValue={(selected) => {
                  if (selected === SELECTOR_TABLE.UNASSIGNED) {
                    return (
                      <Box sx={styles.unassignedContainer}>
                        <PersonIcon sx={styles.unassignedIcon} />
                        <span style={styles.unassignedText}>
                          {SELECTOR_TABLE.UNASSIGNED}
                        </span>
                      </Box>
                    );
                  }
                  return selected;
                }}
              >
                <MenuItem value={SELECTOR_TABLE.UNASSIGNED} sx={styles.menuItem}>
                  {SELECTOR_TABLE.UNASSIGNED}
                </MenuItem>
                {cellData.options.map((option) => (
                  <MenuItem key={option.id} value={option.label} sx={styles.menuItem}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TableCell>
        );
      })}

      {/* Hours and overtime column */}
      {showHoursColumn && (
        <>
          <TableCell sx={styles.adjustCell}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <PremiumTooltip title="Ajustar horas">
                <span>
                  <IconButton
                    size="small"
                    disabled={!hasWorked}
                    sx={styles.adjustButton(hasWorked)}
                    onClick={handleAdjustClick}
                  >
                    <MoreTimeIcon fontSize="small" />
                  </IconButton>
                </span>
              </PremiumTooltip>
            </Stack>
          </TableCell>

          <TableCell sx={styles.hoursCell}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.875rem" }}>
                {totalHours} {SELECTOR_TABLE.HOURS}
              </Typography>
              <PremiumTooltip title={overtime > 0 ? `${overtime} horas extra` : "Horas extra"}>
                <Box sx={styles.overtimeBadge(overtime)}>
                  +{overtime}
                </Box>
              </PremiumTooltip>
            </Stack>
          </TableCell>
        </>
      )}
    </TableRow>
  );
});
