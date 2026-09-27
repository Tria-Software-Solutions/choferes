// Business-day helpers in the company's timezone. The server may run in UTC
// (Render), but "today", quincenas and recurring due dates are local to Costa
// Rica.
export const APP_TIMEZONE = process.env.APP_TIMEZONE || "America/Costa_Rica";

/** Local calendar date (YYYY-MM-DD) of an instant in APP_TIMEZONE. */
export const localDateString = (instant: Date = new Date(), timeZone = APP_TIMEZONE): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);

/** YYYY-MM-DD → Date at local noon (safe for calendar math, no DST edge). */
export const parseISODate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const toISODate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
