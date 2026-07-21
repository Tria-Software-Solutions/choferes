import { useMemo, useCallback } from "react";
import type { Schedule } from "../../../../models/Schedule";
import type { Employee } from "../../../../models/Employee";
import type { HoursWorked } from "../../../../models/HoursWorked";

interface GroupedSchedule {
  label: string;
  dayToSchedule: Record<string, Schedule>;
}

interface UseGroupedSchedulesReturn {
  groupedSchedules: GroupedSchedule[];
  getEmployeesForScheduleAndDay: (
    scheduleId: number,
    date: string,
    employees: Employee[]
  ) => Employee[];
}

interface UseGroupedSchedulesProps {
  schedules: Schedule[];
  hoursWorked: HoursWorked[];
}

const normalizeString = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const useGroupedSchedules = ({
  schedules,
  hoursWorked,
}: UseGroupedSchedulesProps): UseGroupedSchedulesReturn => {
  // Group schedules by normalized label
  const groupedSchedules = useMemo(() => {
    const groups: Record<string, GroupedSchedule> = {};
    
    for (const schedule of schedules) {
      const normLabel = normalizeString(schedule.label);
      if (!groups[normLabel]) {
        groups[normLabel] = { label: schedule.label, dayToSchedule: {} };
      }
      for (const day of schedule.days) {
        // Prioritize first found schedule for each day
        if (!groups[normLabel].dayToSchedule[day]) {
          groups[normLabel].dayToSchedule[day] = schedule;
        }
      }
    }
    
    // Sort: non-special first, then special, alphabetically within each group
    return Object.values(groups).sort((a, b) => {
      const aSpecial = Object.values(a.dayToSchedule).some((s) => s.specialSchedule);
      const bSpecial = Object.values(b.dayToSchedule).some((s) => s.specialSchedule);
      if (aSpecial !== bSpecial) return aSpecial ? 1 : -1;
      return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
    });
  }, [schedules]);

  // Get employees assigned to a schedule on a specific day
  const getEmployeesForScheduleAndDay = useCallback((
    scheduleId: number,
    date: string,
    employees: Employee[]
  ): Employee[] => {
    return employees.filter((employee) => {
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
  }, [hoursWorked]);

  return {
    groupedSchedules,
    getEmployeesForScheduleAndDay,
  };
};
