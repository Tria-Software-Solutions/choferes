import React, { memo, useCallback, useMemo } from "react";
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Employee } from "../../../../models/Employee";
import type { Schedule } from "../../../../models/Schedule";
import type { DayEntry } from "../../../../utils/dates";
import { SELECTOR_TABLE, PERMISSIONS } from "../../../../constants/constants";
import { getScheduleRowStyles } from "../styles/scheduleRow.styles";
import { premiumSelectorMenuProps } from "../SelectorTable.styles";

interface GroupedSchedule {
  label: string;
  dayToSchedule: Record<string, Schedule>;
}

interface ScheduleRowProps {
  group: GroupedSchedule;
  rowIndex: number;
  currentWeek: DayEntry[];
  filteredEmployees: Employee[];
  hoursWorked: import("../../../../models/HoursWorked").HoursWorked[];
  isSmallScreen: boolean;
  permissions?: string[];
  employeeSearchTerms: Record<string, string>;
  onScheduleEmployeesChange: (
    event: SelectChangeEvent<number[]>,
    scheduleId: number,
    date: string
  ) => void;
  onSearchChange: (scheduleId: number, date: string, value: string) => void;
  theme: import("@mui/material").Theme;
  searchInputComponent: React.ReactNode;
}

export const ScheduleRow = memo(function ScheduleRow({
  group,
  rowIndex,
  currentWeek,
  filteredEmployees,
  hoursWorked,
  isSmallScreen,
  permissions,
  employeeSearchTerms,
  onScheduleEmployeesChange,
  onSearchChange,
  theme,
}: ScheduleRowProps) {
  const styles = getScheduleRowStyles(theme, isSmallScreen, rowIndex);
  const canEdit = permissions?.includes(PERMISSIONS.EDIT_EMPLOYEE_ROLES);

  // Get employees for a specific schedule and day
  const getEmployeesForScheduleAndDay = useCallback(
    (scheduleId: number, date: string): Employee[] => {
      return filteredEmployees.filter((employee) => {
        const sameDayRecords = hoursWorked
          .filter(
            (record) =>
              record.employeeId === employee.id &&
              new Date(record.date).toDateString() === new Date(date).toDateString()
          )
          .sort((a, b) => b.id - a.id);

        const latestRecord = sameDayRecords[0];
        return latestRecord?.scheduleId === scheduleId;
      });
    },
    [filteredEmployees, hoursWorked]
  );

  // Get filtered employees for search
  const getFilteredDropdownEmployees = useCallback(
    (scheduleId: number, date: string): Employee[] => {
      const key = `${scheduleId}-${date}`;
      const term = (employeeSearchTerms[key] || "").toLowerCase();

      return filteredEmployees
        .filter((emp) =>
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term)
        )
        .sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`,
            "es",
            { sensitivity: "base" }
          )
        );
    },
    [filteredEmployees, employeeSearchTerms]
  );

  // Check if date is today
  const isToday = useMemo(() => {
    const today = new Date().toDateString();
    return (date: string) => new Date(date).toDateString() === today;
  }, []);

  return (
    <TableRow sx={styles.row}>
      {/* Schedule label cell */}
      <TableCell sx={styles.scheduleCell}>
        <Typography variant="body2" fontWeight={600} sx={styles.scheduleName}>
          {group.label}
        </Typography>
      </TableCell>

      {/* Employee select cells for each day */}
      {currentWeek.map(({ day, date }) => {
        const scheduleForDay = group.dayToSchedule[day.toLowerCase()];
        const isAvailable = !!scheduleForDay;
        const assignedEmployees = isAvailable
          ? getEmployeesForScheduleAndDay(scheduleForDay.id, date)
          : [];
        const today = isToday(date);

        return (
          <TableCell key={day} sx={styles.dayCell(today)}>
            {isAvailable ? (
              <FormControl fullWidth sx={styles.formControl}>
                <Select
                  value={assignedEmployees.map((e) => e.id)}
                  onChange={(e) =>
                    onScheduleEmployeesChange(e, scheduleForDay.id, date)
                  }
                  multiple
                  displayEmpty
                  variant="standard"
                  disabled={!canEdit}
                  MenuProps={premiumSelectorMenuProps}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <Box sx={styles.unassignedContainer}>
                          <PersonIcon sx={styles.unassignedIcon} />
                          <span style={styles.unassignedText}>
                            {SELECTOR_TABLE.UNASSIGNED}
                          </span>
                        </Box>
                      );
                    }
                    const names = selected
                      .map((id) => {
                        const emp = filteredEmployees.find((e) => e.id === id);
                        return emp ? `${emp.firstName} ${emp.lastName}` : "";
                      })
                      .filter(Boolean);

                    return (
                      <Box sx={styles.namesContainer}>
                        {names.map((name, index) => (
                          <Box key={index} sx={styles.employeeChip}>
                            <Typography variant="body2" sx={styles.employeeName}>
                              {name}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    );
                  }}
                >
                  {/* Search input item */}
                  <MenuItem
                    disableRipple
                    sx={styles.searchMenuItem}
                  >
                    <Box sx={styles.searchContainer}>
                      <SearchIcon sx={styles.searchIcon} />
                      <input
                        type="text"
                        placeholder={SELECTOR_TABLE.SEARCH_EMPLOYEE_PLACEHOLDER}
                        value={employeeSearchTerms[`${scheduleForDay.id}-${date}`] || ""}
                        onChange={(e) =>
                          onSearchChange(scheduleForDay.id, date, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key !== "Escape") e.stopPropagation();
                        }}
                        style={styles.searchInput}
                      />
                    </Box>
                  </MenuItem>

                  {/* Employee options */}
                  {getFilteredDropdownEmployees(scheduleForDay.id, date).map((employee) => {
                    const isSelected = assignedEmployees.some((e) => e.id === employee.id);
                    return (
                      <MenuItem
                        key={employee.id}
                        value={employee.id}
                        sx={styles.employeeMenuItem(isSelected)}
                      >
                        <Box sx={styles.checkboxContainer}>
                          <Checkbox
                            checked={isSelected}
                            size="small"
                            sx={styles.checkbox(isSelected)}
                            checkedIcon={<CheckCircleIcon sx={styles.checkedIcon} />}
                          />
                        </Box>
                        <Box sx={styles.employeeInfo}>
                          <Typography sx={styles.employeeNameText}>
                            {employee.firstName} {employee.lastName}
                          </Typography>
                          {isSelected && (
                            <Typography sx={styles.selectedBadge}>
                              ✓
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body2" sx={styles.noAvailable}>
                {SELECTOR_TABLE.NO_AVAILABLE}
              </Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
});
