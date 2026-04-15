import { format } from "date-fns";
import { SelectChangeEvent } from "@mui/material";
import { Employee } from "../../../../models/Employee";
import { Schedule } from "../../../../models/Schedule";
import { HoursWorked } from "../../../../models/HoursWorked";
import { getOptionsForDay } from "../../../../utils/string";
import { SELECTOR_TABLE } from "../../../../constants/constants";

export interface ScheduleCellData {
  formattedDate: string;
  existingRecord: HoursWorked | undefined;
  options: Schedule[];
  validLabels: string[];
  selectedLabel: string;
  finalSelectedLabel: string;
}

/**
 * Gets the schedule data for a specific employee and date
 */
export const getScheduleCellData = (
  employee: Employee,
  day: string,
  date: string,
  schedules: Schedule[],
  hoursWorked: HoursWorked[],
): ScheduleCellData => {
  const formattedDate = format(new Date(date), "yyyy-MM-dd");
  const existingRecord = hoursWorked
    .filter(
      (record) =>
        record.employeeId === employee.id &&
        format(new Date(record.date), "yyyy-MM-dd") === formattedDate,
    )
    .sort((a, b) => b.id - a.id)[0];
  let options = getOptionsForDay(day, schedules);
  
  // Add "Sin asignar" to options so it appears as a MenuItem in the Select
  if (!options.some((opt) => opt.label === SELECTOR_TABLE.UNASSIGNED)) {
    options = [
      { id: -1, label: SELECTOR_TABLE.UNASSIGNED, days: [], hours: 0, specialSchedule: false },
      ...options,
    ];
  }
  
  let validLabels = options.map((option) => option.label);

  const selectedLabel =
    schedules.find(
      (schedule) => schedule.id === existingRecord?.scheduleId,
    )?.label ?? SELECTOR_TABLE.UNASSIGNED;

  const finalSelectedLabel = !existingRecord
    ? SELECTOR_TABLE.UNASSIGNED
    : validLabels.includes(selectedLabel)
    ? selectedLabel
    : validLabels[0] ?? "";

  return {
    formattedDate,
    existingRecord,
    options,
    validLabels,
    selectedLabel,
    finalSelectedLabel,
  };
};

/**
 * Checks if a date is today
 */
export const isToday = (date: string): boolean => {
  return format(new Date(), "yyyy-MM-dd") === format(new Date(date), "yyyy-MM-dd");
};

/**
 * Handles schedule change for an employee
 */
export const handleScheduleChange = (
  event: SelectChangeEvent<string>,
  employeeId: number,
  date: Date,
  handleChange: (
    event: SelectChangeEvent<string>,
    employeeId: number,
    date: Date,
  ) => void,
) => {
  handleChange(event, employeeId, date);
};

/**
 * Gets the badge color for overtime display
 */
export const getOvertimeBadgeColor = (overtime: string | number): "success" | "error" | "warning" => {
  return overtime === 0 || overtime === "0/0" ? "success" : "error";
}; 
