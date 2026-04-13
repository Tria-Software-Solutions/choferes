import {
  addDays,
  differenceInCalendarDays,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { EnglishAbrevMonthOfYear } from "./monthAbreviations";
import { translateMonthToAbrevSpanish } from "./string";

export type DayEntry = {
  day: string;
  date: string;
  isoDate: string;
};

export const formatDate = (date: Date, withTimePart: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleString("es-ES", options);

  const [datePart, timePart] = formattedDate.split(", ");

  if (withTimePart) {
    return `${datePart} de ${timePart}`;
  }

  return datePart;
};

export const formatDateWithDay = (date: Date, withTimePart: boolean) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleString("es-ES", options);
  const parts = formattedDate.split(", ");

  const dayName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const datePart = parts[1];
  const timePart = parts[2];

  if (withTimePart) {
    return `${dayName} ${datePart} de ${timePart}`;
  }

  return `${dayName} ${datePart}`;
};

export const formatDateWithoutYear = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
  };

  return date.toLocaleString("es-ES", options);
};

export const formatHeaderDate = (dateStr: string) => {
  const parts = dateStr.split(" ");
  const day = parts[0];
  const month = parts[1];
  const transformedMonth = translateMonthToAbrevSpanish(
    month as EnglishAbrevMonthOfYear,
  );
  return `${day} ${transformedMonth}`;
};

export const formatHeaderDateWithYear = (dateStr: string) => {
  const [day, month, year] = dateStr.split(" ");
  const transformedMonth = translateMonthToAbrevSpanish(
    month as EnglishAbrevMonthOfYear,
  );
  return `${day} ${transformedMonth} ${year}`;
};

export const getCurrentWeekDates = (weekOffset: number) => {
  const today = new Date();
  // Normalize to midnight to prevent constant recalculation due to millisecond changes
  today.setHours(0, 0, 0, 0);
  const firstDayOfWeek =
    today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
  const startDate = new Date(today.setDate(firstDayOfWeek + weekOffset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    // Also normalize each date to midnight
    date.setHours(0, 0, 0, 0);
    return {
      day: date.toLocaleString("en-US", { weekday: "long" }),
      date: `${date.getDate()} ${date.toLocaleDateString("en-US", {
        month: "short",
      })} ${date.getFullYear()}`,
      isoDate: date.toISOString(),
    };
  });
};

export const getFirstDayOfWeek = (weekOffset: number) => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const targetMonday = addDays(startOfCurrentWeek, weekOffset * 7);
  return targetMonday;
};

const getEndOfNextWeek = (today: Date): Date => {
  let dayOfWeek = today.getDay();

  if (dayOfWeek === 0) {
    dayOfWeek = 7;
  }

  const daysUntilEndOfNextWeek = 14 - dayOfWeek;
  const endOfNextWeek = new Date(today);
  endOfNextWeek.setDate(today.getDate() + daysUntilEndOfNextWeek);
  endOfNextWeek.setHours(23, 59, 59, 999);

  return endOfNextWeek;
};

export const isValidDateForSelect = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfNextWeek = getEndOfNextWeek(today);
  return date <= endOfNextWeek;
};

export const isTodayOrFuture = (date: Date | null): boolean => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

export const getWeekNumberAndYear = (
  date: Date,
): { year: number; weekNumber: number } => {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0);

  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));

  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
  firstThursday.setDate(
    firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7),
  );

  const weekNumber =
    Math.round(
      (tempDate.getTime() - firstThursday.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ) + 1;

  const year = tempDate.getFullYear();

  if (weekNumber === 1 && date.getMonth() === 0) {
    return { year: year - 1, weekNumber: 53 };
  }

  if (weekNumber === 1 && date.getMonth() === 11) {
    return { year: year, weekNumber: 1 };
  }

  return { year, weekNumber };
};

export const getDayName = (date: Date): string => {
  const options: { weekday: "long" } = { weekday: "long" };
  return date.toLocaleDateString("en-US", options).toLowerCase();
};

export const getMidnightDate = (date: Date) => {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  return midnight;
};

export const getWeekNumber = (date: Date): number => {
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);

  const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const firstThursday = new Date(firstDayOfYear);
  firstThursday.setDate(
    firstDayOfYear.getDate() + ((4 - firstDayOfYear.getDay() + 7) % 7),
  );

  const firstMonday = new Date(firstThursday);
  firstMonday.setDate(firstThursday.getDate() - 3);

  const diffInMillis = currentDate.getTime() - firstMonday.getTime();
  const diffInDays = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffInDays / 7) + 1;

  const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);
  const lastThursday = new Date(lastDayOfYear);
  lastThursday.setDate(
    lastDayOfYear.getDate() - ((lastDayOfYear.getDay() + 3) % 7),
  );

  const lastMonday = new Date(lastThursday);
  lastMonday.setDate(lastThursday.getDate() - 3);

  const isWeek53 =
    lastDayOfYear.getDay() === 4 ||
    (lastDayOfYear.getDay() === 3 && weekNumber === 1);

  if (currentDate >= lastMonday && currentDate <= lastDayOfYear) {
    if (currentDate.getDate() === 30 || currentDate.getDate() === 31) {
      return 53;
    }
    return isWeek53 ? 53 : 52;
  }

  if (
    currentDate.getFullYear() === lastDayOfYear.getFullYear() &&
    currentDate.getDate() <= 5 &&
    currentDate.getMonth() === 0
  ) {
    return 1;
  }

  return weekNumber;
};

export const getBiweekNumber = (date: Date): number => {
  const startOfYearDate = startOfYear(date);
  const dayOfYear = differenceInCalendarDays(date, startOfYearDate) + 1;
  const maxDayOfYear = 365;
  const correctedDayOfYear = Math.min(dayOfYear, maxDayOfYear);
  const biweek = Math.ceil(correctedDayOfYear / 15);
  return biweek <= 24 ? biweek : 24;
};

export const getBiweeklyDates = (year: number, biweekNumber: number) => {
  if (biweekNumber < 1 || biweekNumber > 24) {
    throw new Error("Número de quincena inválido. Debe estar entre 1 y 24.");
  }
  const month = Math.floor((biweekNumber - 1) / 2);
  const isFirstBiweek = biweekNumber % 2 === 1;
  const startDay = isFirstBiweek ? 1 : 16;
  const startDate = new Date(year, month, startDay);
  const endDay = isFirstBiweek ? 15 : new Date(year, month + 1, 0).getDate();
  const endDate = new Date(year, month, endDay);
  return {
    startDate,
    endDate,
  };
};

export const getMonthNumber = (date: Date): number => {
  return date.getMonth() + 1;
};

export const hasMultipleBiweeks = (currentWeek: DayEntry[]): boolean => {
  const biweekNumbers = new Set<number>();

  currentWeek.forEach((day) => {
    const date = new Date(day.isoDate);
    biweekNumbers.add(getBiweekNumber(date));
  });

  return biweekNumbers.size > 1;
};

export const hasMultipleMonths = (currentWeek: DayEntry[]): boolean => {
  const months = new Set<number>();

  currentWeek.forEach((day) => {
    const date = new Date(day.isoDate);
    months.add(getMonthNumber(date));
  });

  return months.size > 1;
};

export const hasMultipleYears = (currentWeek: DayEntry[]): boolean => {
  const years = new Set<number>();

  currentWeek.forEach((day) => {
    const date = new Date(day.isoDate);
    years.add(date.getFullYear());
  });

  return years.size > 1;
};

export const getInvolvedPeriods = (
  currentWeek: DayEntry[],
): {
  weekNumbers: { year: number; weekNumber: number }[];
  biweekNumbers: { year: number; biweekNumber: number }[];
  months: { year: number; month: number }[];
} => {
  const weekNumbers = new Set<string>();
  const biweekNumbers = new Set<string>();
  const months = new Set<string>();

  currentWeek.forEach((day) => {
    const date = new Date(day.isoDate);
    const { year, weekNumber } = getWeekNumberAndYear(date);
    const biweekNumber = getBiweekNumber(date);
    const month = getMonthNumber(date);

    weekNumbers.add(`${year}-${weekNumber}`);
    biweekNumbers.add(`${year}-${biweekNumber}`);
    months.add(`${year}-${month}`);
  });

  return {
    weekNumbers: Array.from(weekNumbers).map((entry) => {
      const [year, weekNumber] = entry.split("-").map(Number);
      return { year, weekNumber };
    }),
    biweekNumbers: Array.from(biweekNumbers).map((entry) => {
      const [year, biweekNumber] = entry.split("-").map(Number);
      return { year, biweekNumber };
    }),
    months: Array.from(months).map((entry) => {
      const [year, month] = entry.split("-").map(Number);
      return { year, month };
    }),
  };
};

export const parseIsoDateWithoutTimeZone = (isoString: string): Date => {
  const [year, month, day] = isoString.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
};
