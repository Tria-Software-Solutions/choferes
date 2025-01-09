import { addDays, startOfWeek } from "date-fns";
import { EnglishAbrevMonthOfYear } from "./englishAbrevMonthOfYear";
import { translateMonthToAbrevSpanish } from "./stringUtils";

type DayEntry = {
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

export const formatDateWithoutYear = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
  };

  return date.toLocaleString("es-ES", options);
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const formatHeaderDate = (dateStr: string) => {
  const [day, month] = dateStr.split(" ");
  const transformedMonth = translateMonthToAbrevSpanish(
    month as EnglishAbrevMonthOfYear
  );
  return `${day} ${transformedMonth}`;
};

export const formatHeaderDateWithYear = (dateStr: string) => {
  const [day, month, year] = dateStr.split(" ");
  const transformedMonth = translateMonthToAbrevSpanish(
    month as EnglishAbrevMonthOfYear
  );
  return `${day} ${transformedMonth} ${year}`;
};

export const getCurrentWeekDates = (weekOffset: number) => {
  const today = new Date();
  const firstDayOfWeek =
    today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
  const startDate = new Date(today.setDate(firstDayOfWeek + weekOffset * 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
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

export const getWeekNumber = (date: Date): number => {
  const tempDate = new Date(date.getTime());
  const dayOfWeek = (tempDate.getDay() + 6) % 7;
  tempDate.setDate(tempDate.getDate() - dayOfWeek);
  const startDate = new Date(tempDate.getFullYear(), 0, 1);
  const startDayOfWeek = (startDate.getDay() + 6) % 7;
  const days = Math.floor(
    (tempDate.valueOf() - startDate.valueOf()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + startDayOfWeek) / 7);
};

export const getBiweekNumber = (date: Date): number => {
  const month = date.getMonth();
  const dayOfMonth = date.getDate();
  const biweekNumber = month * 2 + (dayOfMonth <= 15 ? 1 : 2);
  return biweekNumber;
};

export const getStartOfBiweek = (date: Date): Date => {
  const startOfCurrentWeek = startOfWeek(date, { weekStartsOn: 1 });
  const dayOfMonth = date.getDate();
  const biweekNumber = Math.ceil(dayOfMonth / 15);
  if (biweekNumber === 1) {
    return startOfCurrentWeek;
  }
  return addDays(startOfCurrentWeek, 7);
};

export const getEndOfBiweek = (date: Date): Date => {
  const startOfBiweek = getStartOfBiweek(date);
  return addDays(startOfBiweek, 13);
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

export const getInvolvedPeriods = (
  currentWeek: DayEntry[]
): {
  months: number[];
  weekNumbers: number[];
  biweekNumbers: number[];
} => {
  const months = new Set<number>();
  const weekNumbers = new Set<number>();
  const biweekNumbers = new Set<number>();

  currentWeek.forEach((day) => {
    const date = new Date(day.isoDate);
    months.add(getMonthNumber(date));
    weekNumbers.add(getWeekNumber(date));
    biweekNumbers.add(getBiweekNumber(date));
  });

  return {
    months: Array.from(months),
    weekNumbers: Array.from(weekNumbers),
    biweekNumbers: Array.from(biweekNumbers),
  };
};
