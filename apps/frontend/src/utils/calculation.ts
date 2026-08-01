import { OVERTIME } from "../constants/constants";

interface Summary {
  employeeId: number;
  totalHours: number;
  weekNumber?: number;
  biweekNumber?: number;
  month?: number;
  year: number;
}

// Utility functions for calculating total hours and overtime for employees
// Includes logic for single and multiple periods (weekly, biweekly, monthly)
export const calculateTotalHoursAndOvertimeForPeriod = (
  employeeId: number,
  selectedPeriod: "weekly" | "biweekly" | "monthly",
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  weeklySummaries: Summary[],
  biweeklySummaries: Summary[],
  monthlySummaries: Summary[],
) => {
  // Finds the summary for the given period and employee
  const findWeeklySummary = () =>
    weeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.weekNumber === weekNumber &&
        s.year === year,
    );

  const findBiweeklySummary = () =>
    biweeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.biweekNumber === biweekNumber &&
        s.year === year,
    );

  const findMonthlySummary = () =>
    monthlySummaries.find(
      (s) =>
        s.employeeId === employeeId && s.month === month && s.year === year,
    );

  const summary =
    selectedPeriod === "weekly"
      ? findWeeklySummary()
      : selectedPeriod === "biweekly"
        ? findBiweeklySummary()
        : findMonthlySummary();

  const totalHours = summary?.totalHours ?? 0;

  // Calculates overtime based on the period's threshold
  let overtime = 0;
  if (selectedPeriod === "weekly" && totalHours > OVERTIME.WEEKLY) {
    overtime = totalHours - OVERTIME.WEEKLY;
  } else if (selectedPeriod === "biweekly" && totalHours > OVERTIME.BIWEEKLY) {
    overtime = totalHours - OVERTIME.BIWEEKLY;
  } else if (selectedPeriod === "monthly" && totalHours > OVERTIME.MONTHLY) {
    overtime = totalHours - OVERTIME.MONTHLY;
  }

  return { totalHours, overtime };
};

export const calculateTotalHoursAndOvertimeForPeriods = (
  employeeId: number,
  selectedPeriod: "weekly" | "biweekly" | "monthly",
  weekNumbers: {
    year: number;
    weekNumber: number;
  }[],
  biweekNumbers: {
    year: number;
    biweekNumber: number;
  }[],
  months: {
    year: number;
    month: number;
  }[],
  weeklySummaries: Summary[],
  biweeklySummaries: Summary[],
  monthlySummaries: Summary[],
) => {
  // Finds the summaries for the given periods and employee
  const findFirstWeeklySummary = () =>
    weeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.weekNumber === weekNumbers[0].weekNumber &&
        s.year === weekNumbers[0].year,
    );

  // Si una semana ISO abarca dos años calendario (p.ej. 29 dic - 4 ene) es UN solo
  // periodo semanal; la segunda entrada puede no existir y debe tratarse como 0.
  const findSecondWeeklySummary = () =>
    weekNumbers.length > 1
      ? weeklySummaries.find(
          (s) =>
            s.employeeId === employeeId &&
            s.weekNumber === weekNumbers[1].weekNumber &&
            s.year === weekNumbers[1].year,
        )
      : undefined;

  const findFirstBiweeklySummary = () =>
    biweeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.biweekNumber === biweekNumbers[0].biweekNumber &&
        s.year === biweekNumbers[0].year,
    );

  const findSecondBiweeklySummary = () =>
    biweekNumbers.length > 1
      ? biweeklySummaries.find(
          (s) =>
            s.employeeId === employeeId &&
            s.biweekNumber === biweekNumbers[1].biweekNumber &&
            s.year === biweekNumbers[1].year,
        )
      : undefined;

  const findFirstMonthlySummary = () =>
    monthlySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.month === months[0].month &&
        s.year === months[0].year,
    );

  const findSecondMonthlySummary = () =>
    months.length > 1
      ? monthlySummaries.find(
          (s) =>
            s.employeeId === employeeId &&
            s.month === months[1].month &&
            s.year === months[1].year,
        )
      : undefined;

  const firstSummary =
    selectedPeriod === "weekly"
      ? (findFirstWeeklySummary()?.totalHours ?? 0)
      : selectedPeriod === "biweekly"
        ? (findFirstBiweeklySummary()?.totalHours ?? 0)
        : (findFirstMonthlySummary()?.totalHours ?? 0);

  const secondSummary =
    selectedPeriod === "weekly"
      ? (findSecondWeeklySummary()?.totalHours ?? 0)
      : selectedPeriod === "biweekly"
        ? (findSecondBiweeklySummary()?.totalHours ?? 0)
        : (findSecondMonthlySummary()?.totalHours ?? 0);

  const overtimeThreshold =
    selectedPeriod === "weekly"
      ? OVERTIME.WEEKLY
      : selectedPeriod === "biweekly"
        ? OVERTIME.BIWEEKLY
        : OVERTIME.MONTHLY;

  // Sum totals first, then apply the threshold once to the combined total.
  // This correctly handles periods that span across boundaries:
  // e.g., a week crossing two months shouldn't apply the monthly threshold per sub-period.
  const totalHours = (firstSummary ?? 0) + (secondSummary ?? 0);
  const overtime = totalHours > overtimeThreshold ? totalHours - overtimeThreshold : 0;

  return { totalHours, overtime };
};
