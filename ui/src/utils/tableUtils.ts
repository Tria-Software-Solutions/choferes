interface Summary {
  employeeId: number;
  totalHours: number;
  weekNumber?: number;
  biweekNumber?: number;
  month?: number;
  year: number;
}

export const calculateTotalHoursForPeriod = (
  employeeId: number,
  selectedPeriod: "weekly" | "biweekly" | "monthly",
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  weeklySummaries: Summary[],
  biweeklySummaries: Summary[],
  monthlySummaries: Summary[]
): number => {
  const summary =
    selectedPeriod === "weekly"
      ? weeklySummaries.find(
          (s) =>
            s.employeeId === employeeId &&
            s.weekNumber === weekNumber &&
            s.year === year
        )
      : selectedPeriod === "biweekly"
      ? biweeklySummaries.find(
          (s) =>
            s.employeeId === employeeId &&
            s.biweekNumber === biweekNumber &&
            s.year === year
        )
      : monthlySummaries.find(
          (s) =>
            s.employeeId === employeeId && s.month === month && s.year === year
        );

  return summary ? summary.totalHours : 0;
};

export const getBackgroundColor = (rowIndex: number) => {
  return rowIndex % 2 === 0 ? "white" : "#f5f5f5";
};
