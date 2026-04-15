import React, { memo, useCallback, useMemo } from "react";
import {
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import type { Employee } from "../../../../models/Employee";
import type { Schedule } from "../../../../models/Schedule";
import type { DayEntry } from "../../../../utils/dates";
import { SELECTOR_TABLE, PERMISSIONS } from "../../../../constants/constants";
import { getScheduleRowStyles } from "../styles/scheduleRow.styles";
import { ScheduleCellDropdown } from "./ScheduleCellDropdown";

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
    value: number[],
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
              <ScheduleCellDropdown
                assignedEmployees={assignedEmployees}
                filteredEmployees={filteredEmployees}
                canEdit={canEdit}
                employeeSearchTerms={employeeSearchTerms}
                onScheduleEmployeesChange={onScheduleEmployeesChange}
                onSearchChange={onSearchChange}
                scheduleForDay={scheduleForDay}
                date={date}
                theme={theme}
                styles={styles}
              />
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
