import { OVERTIME } from "../constants/constants";

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
) => {
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
      : selectedPeriod === "monthly"
      ? monthlySummaries.find(
          (s) =>
            s.employeeId === employeeId && s.month === month && s.year === year
        )
      : null;

  if (summary) {
    let overtime = 0;

    if (selectedPeriod === "weekly" && summary.totalHours > OVERTIME.WEEKLY) {
      overtime = summary.totalHours - OVERTIME.WEEKLY;
    }

    if (
      selectedPeriod === "biweekly" &&
      summary.totalHours > OVERTIME.BIWEEKLY
    ) {
      overtime = summary.totalHours - OVERTIME.BIWEEKLY;
    }

    if (selectedPeriod === "monthly" && summary.totalHours > OVERTIME.MONTHLY) {
      overtime = summary.totalHours - OVERTIME.MONTHLY;
    }

    return { totalHours: summary.totalHours, overtime };
  }

  return { totalHours: 0, overtime: 0 };
};

export const calculateTotalHoursForPeriods = (
  employeeId: number,
  multiplePeriods: {
    weekNumbers: {
      year: number;
      weekNumber: number;
    }[];
    biweekNumbers: number[];
    months: number[];
  },
  selectedPeriod: "weekly" | "biweekly" | "monthly",
  year: number,
  weeklySummaries: Summary[],
  biweeklySummaries: Summary[],
  monthlySummaries: Summary[]
) => {
  const { weekNumbers, biweekNumbers, months } = multiplePeriods;

  const summary =
    selectedPeriod === "weekly"
      ? weekNumbers
          .map((week) => {
            const summary = weeklySummaries.find(
              (s) =>
                s.employeeId === employeeId &&
                s.weekNumber === week.weekNumber &&
                s.year === week.year
            );
            return summary ? summary.totalHours : 0;
          })
          .join(" / ") 
      : selectedPeriod === "biweekly"
      ? biweekNumbers
          .map((biweek) => {
            const summary = biweeklySummaries.find(
              (s) =>
                s.employeeId === employeeId &&
                s.biweekNumber === biweek &&
                s.year === year
            );
            return summary ? summary.totalHours : 0;
          })
          .join(" / ")  
      : selectedPeriod === "monthly"
      ? months
          .map((month) => {
            const summary = monthlySummaries.find(
              (s) =>
                s.employeeId === employeeId &&
                s.month === month &&
                s.year === year
            );
            return summary ? summary.totalHours : 0;
          })
          .join(" / ")  
      : null;

  // Si no se encuentra el resumen, retornar las horas en el formato correcto
  if (summary) {
    return { totalHours: summary, overtime: 0 };  // Overtime no se calcula aquí porque no sumamos las horas
  }

  return { totalHours: "0", overtime: 0 };
};


export const getBackgroundColor = (rowIndex: number) => {
  return rowIndex % 2 === 0 ? "white" : "#f5f5f5";
};
