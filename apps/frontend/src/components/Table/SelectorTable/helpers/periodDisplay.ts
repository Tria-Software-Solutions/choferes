import { formatDateWithoutYear, getBiweeklyDates, hasMultipleYears, hasMultipleBiweeks, hasMultipleMonths, DayEntry } from "../../../../utils/dates";
import { getMonthName } from "../../../../utils/string";
import { SELECTOR_TABLE } from "../../../../constants/constants";
import { PeriodType } from "./hoursCalculation";

export interface MultiplePeriods {
  weekNumbers: Array<{ weekNumber: number; year: number }>;
  biweekNumbers: Array<{ biweekNumber: number; year: number }>;
  months: Array<{ month: number; year: number }>;
}

/**
 * Renders the period header text based on selected period and current week
 */
export const renderPeriodHeader = (
  selectedPeriod: PeriodType,
  currentWeek: DayEntry[],
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  multiplePeriods: MultiplePeriods,
) => {
  if (selectedPeriod === "weekly") {
    return hasMultipleYears(currentWeek)
      ? `${SELECTOR_TABLE.WEEKS} ${multiplePeriods.weekNumbers[1].weekNumber} / ${multiplePeriods.weekNumbers[0].weekNumber}`
      : `${SELECTOR_TABLE.WEEK} ${weekNumber}`;
  } else if (selectedPeriod === "biweekly") {
    return hasMultipleBiweeks(currentWeek)
      ? `${SELECTOR_TABLE.BIWEEKS} ${multiplePeriods.biweekNumbers[0].biweekNumber} / ${multiplePeriods.biweekNumbers[1].biweekNumber}`
      : `${SELECTOR_TABLE.BIWEEK} ${biweekNumber}`;
  } else {
    return hasMultipleMonths(currentWeek)
      ? `${getMonthName(multiplePeriods.months[0].month)} / ${getMonthName(multiplePeriods.months[1].month)}`
      : `${getMonthName(month)}`;
  }
};

/**
 * Renders the period footer text based on selected period and current week
 */
export const renderPeriodFooter = (
  selectedPeriod: PeriodType,
  currentWeek: DayEntry[],
  weekNumber: number,
  biweekNumber: number,
  month: number,
  year: number,
  multiplePeriods: MultiplePeriods,
) => {
  if (selectedPeriod === "weekly") {
    return `Semana del ${formatDateWithoutYear(new Date(currentWeek[0]?.date))} al ${formatDateWithoutYear(new Date(currentWeek[6]?.date))}`;
  } else if (selectedPeriod === "biweekly") {
    if (hasMultipleBiweeks(currentWeek)) {
      return `Quincenas del ${formatDateWithoutYear(
        getBiweeklyDates(year, multiplePeriods.biweekNumbers[0].biweekNumber).startDate,
      )} al ${formatDateWithoutYear(
        getBiweeklyDates(year, multiplePeriods.biweekNumbers[0].biweekNumber).endDate,
      )} / ${formatDateWithoutYear(
        getBiweeklyDates(year, multiplePeriods.biweekNumbers[1].biweekNumber).startDate,
      )} al ${formatDateWithoutYear(
        getBiweeklyDates(year, multiplePeriods.biweekNumbers[1].biweekNumber).endDate,
      )} del ${year}`;
    } else {
      return `Quincena del ${formatDateWithoutYear(
        getBiweeklyDates(year, biweekNumber).startDate,
      )} al ${formatDateWithoutYear(
        getBiweeklyDates(year, biweekNumber).endDate,
      )}`;
    }
  } else {
    if (hasMultipleMonths(currentWeek)) {
      return `${getMonthName(multiplePeriods.months[0].month)} / ${getMonthName(multiplePeriods.months[1].month)} del ${year}`;
    } else {
      return `${getMonthName(month)}`;
    }
  }
};

/**
 * Gets the period message for the adjustment dialog
 */
export const getPeriodMessage = (selectedPeriod: PeriodType) => {
  switch (selectedPeriod) {
    case "weekly":
      return SELECTOR_TABLE.WEEKLY_HOURS_MESSAGE;
    case "biweekly":
      return SELECTOR_TABLE.BIWEEKLY_HOURS_MESSAGE;
    case "monthly":
      return SELECTOR_TABLE.MONTHLY_HOURS_MESSAGE;
    default:
      return "";
  }
};

 