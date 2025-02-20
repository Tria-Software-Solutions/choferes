import { OVERTIME } from "../constants/constants";

interface Summary {
  employeeId: number;
  totalHours: number;
  weekNumber?: number;
  biweekNumber?: number;
  month?: number;
  year: number;
}

export const calculateTotalHoursAndOvertimeForPeriod = (
  employeeId: number,
  selectedPeriod: "weekly" | "biweekly" | "monthly",
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  weeklySummaries: Summary[],
  biweeklySummaries: Summary[],
  monthlySummaries: Summary[]
) => {
  const findWeeklySummary = () =>
    weeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.weekNumber === weekNumber &&
        s.year === year
    );

  const findBiweeklySummary = () =>
    biweeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.biweekNumber === biweekNumber &&
        s.year === year
    );

  const findMonthlySummary = () =>
    monthlySummaries.find(
      (s) => s.employeeId === employeeId && s.month === month && s.year === year
    );

  const summary =
    selectedPeriod === "weekly"
      ? findWeeklySummary()
      : selectedPeriod === "biweekly"
      ? findBiweeklySummary()
      : findMonthlySummary();

  const totalHours = summary?.totalHours ?? 0;

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
  year: number,
  weeklySummaries: Summary[],
  biweeklySummaries: Summary[],
  monthlySummaries: Summary[]
) => {
  const findFirstWeeklySummary = () =>
    weeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.weekNumber === weekNumbers[1].weekNumber &&
        s.year === weekNumbers[1].year
    );

  const findSecondWeeklySummary = () =>
    weeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.weekNumber === weekNumbers[0].weekNumber &&
        s.year === weekNumbers[0].year
    );

  const findFirstBiweeklySummary = () =>
    biweeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.biweekNumber === biweekNumbers[0].biweekNumber &&
        s.year === biweekNumbers[0].year
    );

  const findSecondBiweeklySummary = () =>
    biweeklySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.biweekNumber === biweekNumbers[1].biweekNumber &&
        s.year === biweekNumbers[1].year
    );

  const findFirstMonthlySummary = () =>
    monthlySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.month === months[0].month &&
        s.year === months[0].year
    );

  const findSecondMonthlySummary = () =>
    monthlySummaries.find(
      (s) =>
        s.employeeId === employeeId &&
        s.month === months[1].month &&
        s.year === months[1].year
    );

  const firstSummary =
    selectedPeriod === "weekly"
      ? findFirstWeeklySummary()?.totalHours ?? 0
      : selectedPeriod === "biweekly"
      ? findFirstBiweeklySummary()?.totalHours ?? 0
      : findFirstMonthlySummary()?.totalHours ?? 0;

  const secondSummary =
    selectedPeriod === "weekly"
      ? findSecondWeeklySummary()?.totalHours ?? 0
      : selectedPeriod === "biweekly"
      ? findSecondBiweeklySummary()?.totalHours ?? 0
      : findSecondMonthlySummary()?.totalHours ?? 0;

  const overtimeThreshold =
    selectedPeriod === "weekly"
      ? OVERTIME.WEEKLY
      : selectedPeriod === "biweekly"
      ? OVERTIME.BIWEEKLY
      : OVERTIME.MONTHLY;

  const firstOvertime =
    firstSummary > overtimeThreshold ? firstSummary - overtimeThreshold : 0;

  const secondOvertime =
    secondSummary > overtimeThreshold ? secondSummary - overtimeThreshold : 0;

  const totalHours = [firstSummary, secondSummary].join(" / ");
  const overtime = [firstOvertime, secondOvertime].join("/");

  return { totalHours, overtime };
};
