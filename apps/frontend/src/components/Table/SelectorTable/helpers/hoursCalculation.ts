import { Employee } from "../../../../models/Employee";
import { WeeklySummary } from "../../../../models/WeeklySummary";
import { BiweeklySummary } from "../../../../models/BiweeklySummary";
import { MonthlySummary } from "../../../../models/MonthlySummary";
import {
  calculateTotalHoursAndOvertimeForPeriod,
  calculateTotalHoursAndOvertimeForPeriods,
} from "../../../../utils/calculation";
import { hasMultipleYears, hasMultipleBiweeks, hasMultipleMonths, DayEntry } from "../../../../utils/dates";

export type PeriodType = "weekly" | "biweekly" | "monthly";
export type HoursType = "totalHours" | "overtime";

export interface HoursCalculationParams {
  employee: Employee;
  period: PeriodType;
  type: HoursType;
  weekNumber: number;
  biweekNumber: number;
  month: number;
  year: number;
  weeklySummaries: WeeklySummary[];
  biweeklySummaries: BiweeklySummary[];
  monthlySummaries: MonthlySummary[];
}

export interface HoursCalculationForPeriodsParams extends HoursCalculationParams {
  multiplePeriods: {
    weekNumbers: Array<{ weekNumber: number; year: number }>;
    biweekNumbers: Array<{ biweekNumber: number; year: number }>;
    months: Array<{ month: number; year: number }>;
  };
}

/**
 * Calculates total hours or overtime for a single period
 */
export const calculateHoursForPeriod = ({
  employee,
  period,
  type,
  weekNumber,
  biweekNumber,
  month,
  year,
  weeklySummaries,
  biweeklySummaries,
  monthlySummaries,
}: HoursCalculationParams) => {
  const result = calculateTotalHoursAndOvertimeForPeriod(
    employee.id,
    period,
    weekNumber,
    biweekNumber,
    month,
    year,
    weeklySummaries,
    biweeklySummaries,
    monthlySummaries,
  );
  
  return type === "totalHours" ? result.totalHours : result.overtime;
};

/**
 * Calculates total hours or overtime for multiple periods
 */
export const calculateHoursForPeriods = ({
  employee,
  period,
  type,
  multiplePeriods,
  weeklySummaries,
  biweeklySummaries,
  monthlySummaries,
}: HoursCalculationForPeriodsParams) => {
  const result = calculateTotalHoursAndOvertimeForPeriods(
    employee.id,
    period,
    multiplePeriods.weekNumbers,
    multiplePeriods.biweekNumbers,
    multiplePeriods.months,
    weeklySummaries,
    biweeklySummaries,
    monthlySummaries,
  );
  
  return type === "totalHours" ? result.totalHours : result.overtime;
};

/**
 * Calculates total hours for an employee based on selected period and current week
 */
export const calculateTotalHours = (
  employee: Employee,
  selectedPeriod: PeriodType,
  currentWeek: DayEntry[],
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  weeklySummaries: WeeklySummary[],
  biweeklySummaries: BiweeklySummary[],
  monthlySummaries: MonthlySummary[],
  multiplePeriods: {
    weekNumbers: Array<{ weekNumber: number; year: number }>;
    biweekNumbers: Array<{ biweekNumber: number; year: number }>;
    months: Array<{ month: number; year: number }>;
  },
) => {
  if (selectedPeriod === "weekly") {
    return hasMultipleYears(currentWeek)
      ? calculateHoursForPeriods({
          employee,
          period: selectedPeriod,
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          multiplePeriods,
        })
      : calculateHoursForPeriod({
          employee,
          period: selectedPeriod,
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        });
  } else if (selectedPeriod === "biweekly") {
    return hasMultipleYears(currentWeek) || hasMultipleBiweeks(currentWeek)
      ? calculateHoursForPeriods({
          employee,
          period: selectedPeriod,
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          multiplePeriods,
        })
      : calculateHoursForPeriod({
          employee,
          period: selectedPeriod,
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        });
  } else {
    return hasMultipleYears(currentWeek) || hasMultipleMonths(currentWeek)
      ? calculateHoursForPeriods({
          employee,
          period: selectedPeriod,
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          multiplePeriods,
        })
      : calculateHoursForPeriod({
          employee,
          period: selectedPeriod,
          type: "totalHours",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        });
  }
};

/**
 * Calculates overtime for an employee based on selected period and current week
 */
export const calculateOvertime = (
  employee: Employee,
  period: PeriodType,
  currentWeek: DayEntry[],
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  weeklySummaries: WeeklySummary[],
  biweeklySummaries: BiweeklySummary[],
  monthlySummaries: MonthlySummary[],
  multiplePeriods: {
    weekNumbers: Array<{ weekNumber: number; year: number }>;
    biweekNumbers: Array<{ biweekNumber: number; year: number }>;
    months: Array<{ month: number; year: number }>;
  },
) => {
  if (period === "weekly") {
    return hasMultipleYears(currentWeek)
      ? calculateHoursForPeriods({
          employee,
          period: period,
          type: "overtime",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          multiplePeriods,
        })
      : calculateHoursForPeriod({
          employee,
          period: period,
          type: "overtime",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        });
  } else if (period === "biweekly") {
    return hasMultipleYears(currentWeek) || hasMultipleBiweeks(currentWeek)
      ? calculateHoursForPeriods({
          employee,
          period: period,
          type: "overtime",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          multiplePeriods,
        })
      : calculateHoursForPeriod({
          employee,
          period: period,
          type: "overtime",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        });
  } else {
    return hasMultipleYears(currentWeek) || hasMultipleMonths(currentWeek)
      ? calculateHoursForPeriods({
          employee,
          period: period,
          type: "overtime",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
          multiplePeriods,
        })
      : calculateHoursForPeriod({
          employee,
          period: period,
          type: "overtime",
          weekNumber,
          biweekNumber,
          month,
          year,
          weeklySummaries,
          biweeklySummaries,
          monthlySummaries,
        });
  }
};

/**
 * Checks if an employee has worked in the current week
 */
export const hasWorkedCurrentWeek = (
  employee: Employee,
  weekNumber: number,
  year: number,
  weeklySummaries: WeeklySummary[],
): boolean => {
  return weeklySummaries.some(
    (summary) =>
      summary.employeeId === employee.id &&
      summary.weekNumber === weekNumber &&
      summary.year === year,
  );
}; 