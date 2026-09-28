// In-process background jobs. They also run once at startup, so work missed
// while the server was asleep (e.g. a free-tier instance) is caught up as
// soon as it wakes up. Every job is idempotent and guarded against overlap.
import { generateBiweeklyPayments } from "./paymentService";
import { dispatchDueReminders } from "./taskService";
import { processScheduledTerminations } from "./employeeService";
import { getBiweekNumber } from "./summaryRecalculationService";
import { localDateString, parseISODate } from "../utils/timezone";

const PAYROLL_INTERVAL_MS = 30 * 60 * 1000;
const REMINDER_INTERVAL_MS = 5 * 60 * 1000;  // 5 min
const TERMINATION_INTERVAL_MS = 24 * 60 * 60 * 1000;

const log = (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.error("[scheduler]", ...args);
};

const guarded = (name: string, job: () => Promise<void>) => {
  let running = false;
  return async () => {
    if (running) return;
    running = true;
    try {
      await job();
    } catch (error) {
      log(`${name} failed:`, error instanceof Error ? error.message : error);
    } finally {
      running = false;
    }
  };
};

/** Current and previous quincena in the company's timezone. */
export const currentAndPreviousBiweeks = (now: Date = new Date()) => {
  const today = parseISODate(localDateString(now));
  const current = { year: today.getFullYear(), biweekNumber: getBiweekNumber(today) };
  const previous =
    current.biweekNumber === 1
      ? { year: current.year - 1, biweekNumber: 24 }
      : { year: current.year, biweekNumber: current.biweekNumber - 1 };
  return { current, previous };
};

// Keeps the pay slips of the running quincena filled (and those of the one
// that just closed, in case hours were corrected before paying).
export const runPayrollJob = guarded("payroll", async () => {
  const { current, previous } = currentAndPreviousBiweeks();
  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const period of [previous, current]) {
    const result = await generateBiweeklyPayments(period.year, period.biweekNumber);
    if (result.created || result.refreshed) {
      log(
        `boletas Q${period.biweekNumber}/${period.year}: ${result.created} creadas, ${result.refreshed} actualizadas`,
      );
    }
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */
});

export const runReminderJob = guarded("reminders", async () => {
  const sent = await dispatchDueReminders();
  if (sent > 0) log(`${sent} recordatorio(s) enviados`);
});

export const runScheduledTerminationsJob = guarded("terminations", async () => {
  const count = await processScheduledTerminations();
  if (count > 0) log(`${count} empleado(s) procesados por finalización programada`);
});

let timers: Array<ReturnType<typeof setInterval>> = [];

export const startSchedulers = (): void => {
  if (process.env.NODE_ENV === "test" || process.env.DISABLE_SCHEDULERS === "true") return;
  if (timers.length > 0) return;

  runReminderJob();
  runPayrollJob();
  runScheduledTerminationsJob();
  timers = [
    setInterval(runReminderJob, REMINDER_INTERVAL_MS),
    setInterval(runPayrollJob, PAYROLL_INTERVAL_MS),
    setInterval(runScheduledTerminationsJob, TERMINATION_INTERVAL_MS),
  ];
  timers.forEach((timer) => timer.unref());
  log("jobs iniciados (boletas cada 30 min, recordatorios cada 30 s, finalizaciones cada 24 h)");
};

export const stopSchedulers = (): void => {
  timers.forEach((timer) => clearInterval(timer));
  timers = [];
};
