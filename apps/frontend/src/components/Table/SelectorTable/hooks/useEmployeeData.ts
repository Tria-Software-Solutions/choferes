import { useMemo, useCallback } from "react";
import type { Employee } from "../../../../models/Employee";
import type { HoursWorked } from "../../../../models/HoursWorked";
import type { WeeklySummary } from "../../../../models/WeeklySummary";
import type { BiweeklySummary } from "../../../../models/BiweeklySummary";
import type { MonthlySummary } from "../../../../models/MonthlySummary";
import {
  calculateTotalHours,
  calculateOvertime,
  hasWorkedCurrentWeek,
} from "../helpers/hoursCalculation";
import type { DayEntry } from "../../../../utils/dates";
import { OVERTIME } from "../../../../constants/constants";

type OrderDirection = "asc" | "desc";
type PeriodType = "weekly" | "biweekly" | "monthly";

interface UseEmployeeDataProps {
  filteredEmployees: Employee[];
  hoursWorked: HoursWorked[];
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
  currentWeek: DayEntry[];
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  selectedPeriod: PeriodType;
  orderDirection: OrderDirection;
  page: number;
  rowsPerPage: number;
}

interface EmployeeWithCalculations extends Employee {
  totalHours: string | number;
  overtime: string | number;
  hasWorked: boolean;
}

interface UseEmployeeDataReturn {
  sortedEmployees: Employee[];
  paginatedEmployees: Employee[];
  employeesWithCalculations: EmployeeWithCalculations[];
  totalCount: number;
  getEmployeeTotalHours: (employee: Employee) => string | number;
  getEmployeeOvertime: (employee: Employee) => string | number;
  hasEmployeeWorked: (employee: Employee) => boolean;
  getEmployeeWeeklyHours: (id: number) => number;
  getEmployeeBiweeklyHours: (id: number) => number;
  getEmployeeMonthlyHours: (id: number) => number;
  getEmployeeWeeklyOvertime: (id: number) => number;
  getEmployeeBiweeklyOvertime: (id: number) => number;
  getEmployeeMonthlyOvertime: (id: number) => number;
  getEmployeesForScheduleAndDay: (
    scheduleId: number,
    date: string,
    employees: Employee[]
  ) => Employee[];
  getFilteredDropdownEmployees: (
    scheduleId: number,
    date: string,
    searchTerms: Record<string, string>,
    allEmployees: Employee[]
  ) => Employee[];
}

const calculateOvertimeHours = (totalHours: number, threshold: number): number =>
  totalHours > threshold ? totalHours - threshold : 0;

export const useEmployeeData = ({
  filteredEmployees,
  hoursWorked,
  weeklySummaries,
  biweeklySummaries,
  monthlySummaries,
  currentWeek,
  weekNumber,
  biweekNumber,
  month,
  year,
  selectedPeriod,
  orderDirection,
  page,
  rowsPerPage,
}: UseEmployeeDataProps): UseEmployeeDataReturn => {
  // Sort employees by name
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`;
      const nameB = `${b.firstName} ${b.lastName}`;
      return orderDirection === "asc"
        ? nameA.localeCompare(nameB, "es", { sensitivity: "base" })
        : nameB.localeCompare(nameA, "es", { sensitivity: "base" });
    });
  }, [filteredEmployees, orderDirection]);

  // Paginate employees
  const paginatedEmployees = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedEmployees.slice(startIndex, endIndex);
  }, [sortedEmployees, page, rowsPerPage]);

  // Multiple periods calculation
  const multiplePeriods = useMemo(() => {
    const weekNumbers: Array<{ weekNumber: number; year: number }> = [];
    const biweekNumbers: Array<{ biweekNumber: number; year: number }> = [];
    const months: Array<{ month: number; year: number }> = [];

    currentWeek.forEach(({ date }) => {
      const d = new Date(date);
      const weekYear = new Date(d.getFullYear(), 0, 1 + (d.getDay() || 7) - 1);
      const weekNum = Math.ceil((((d.getTime() - weekYear.getTime()) / 86400000) + weekYear.getDay() + 1) / 7);
      
      if (!weekNumbers.some(w => w.weekNumber === weekNum && w.year === d.getFullYear())) {
        weekNumbers.push({ weekNumber: weekNum, year: d.getFullYear() });
      }

      const biweekNum = Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 14);
      if (!biweekNumbers.some(b => b.biweekNumber === biweekNum && b.year === d.getFullYear())) {
        biweekNumbers.push({ biweekNumber: biweekNum, year: d.getFullYear() });
      }

      if (!months.some(m => m.month === d.getMonth() + 1 && m.year === d.getFullYear())) {
        months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
      }
    });

    return { weekNumbers, biweekNumbers, months };
  }, [currentWeek]);

  // Memoized calculation functions
  const getEmployeeTotalHours = useCallback((employee: Employee): string | number => {
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
      multiplePeriods
    );
  }, [selectedPeriod, currentWeek, weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries, multiplePeriods]);

  const getEmployeeOvertime = useCallback((employee: Employee): string | number => {
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
      multiplePeriods
    );
  }, [selectedPeriod, currentWeek, weekNumber, biweekNumber, month, year, weeklySummaries, biweeklySummaries, monthlySummaries, multiplePeriods]);

  const hasEmployeeWorked = useCallback((employee: Employee): boolean => {
    return hasWorkedCurrentWeek(employee, weekNumber, year, weeklySummaries);
  }, [weekNumber, year, weeklySummaries]);

  // Employee calculations for paginated employees
  const employeesWithCalculations = useMemo(() => {
    return paginatedEmployees.map(employee => ({
      ...employee,
      totalHours: getEmployeeTotalHours(employee),
      overtime: getEmployeeOvertime(employee),
      hasWorked: hasEmployeeWorked(employee),
    }));
  }, [paginatedEmployees, getEmployeeTotalHours, getEmployeeOvertime, hasEmployeeWorked]);

  // Individual hour getters for summary dialog
  const getEmployeeWeeklyHours = useCallback((id: number): number => {
    const summary = weeklySummaries.find(
      (s) => s.employeeId === id && s.weekNumber === weekNumber && s.year === year
    );
    return summary ? summary.totalHours : 0;
  }, [weeklySummaries, weekNumber, year]);

  const getEmployeeBiweeklyHours = useCallback((id: number): number => {
    const summary = biweeklySummaries.find(
      (s) => s.employeeId === id && s.biweekNumber === biweekNumber && s.year === year
    );
    return summary ? summary.totalHours : 0;
  }, [biweeklySummaries, biweekNumber, year]);

  const getEmployeeMonthlyHours = useCallback((id: number): number => {
    const summary = monthlySummaries.find(
      (s) => s.employeeId === id && s.month === month && s.year === year
    );
    return summary ? summary.totalHours : 0;
  }, [monthlySummaries, month, year]);

  const getEmployeeWeeklyOvertime = useCallback((id: number): number => {
    return calculateOvertimeHours(getEmployeeWeeklyHours(id), OVERTIME.WEEKLY);
  }, [getEmployeeWeeklyHours]);

  const getEmployeeBiweeklyOvertime = useCallback((id: number): number => {
    return calculateOvertimeHours(getEmployeeBiweeklyHours(id), OVERTIME.BIWEEKLY);
  }, [getEmployeeBiweeklyHours]);

  const getEmployeeMonthlyOvertime = useCallback((id: number): number => {
    return calculateOvertimeHours(getEmployeeMonthlyHours(id), OVERTIME.MONTHLY);
  }, [getEmployeeMonthlyHours]);

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

  // Get filtered employees for dropdown search
  const getFilteredDropdownEmployees = useCallback((
    scheduleId: number,
    date: string,
    searchTerms: Record<string, string>,
    allEmployees: Employee[]
  ): Employee[] => {
    const key = `${scheduleId}-${date}`;
    const term = (searchTerms[key] || "").toLowerCase();
    
    return allEmployees
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
  }, []);

  return {
    sortedEmployees,
    paginatedEmployees,
    employeesWithCalculations,
    totalCount: sortedEmployees.length,
    getEmployeeTotalHours,
    getEmployeeOvertime,
    hasEmployeeWorked,
    getEmployeeWeeklyHours,
    getEmployeeBiweeklyHours,
    getEmployeeMonthlyHours,
    getEmployeeWeeklyOvertime,
    getEmployeeBiweeklyOvertime,
    getEmployeeMonthlyOvertime,
    getEmployeesForScheduleAndDay,
    getFilteredDropdownEmployees,
  };
};
