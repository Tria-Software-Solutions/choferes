// In-process background jobs with Costa Rica timezone.
// They run once at startup (to catch up if server was asleep) and then
// on a cron schedule using America/Costa_Rica timezone.
import cron, { ScheduledTask } from "node-cron";
import { generateBiweeklyPayments } from "./paymentService";
import { dispatchDueReminders } from "./taskService";
import { processScheduledTerminations } from "./employeeService";
import { getBiweekNumber } from "./summaryRecalculationService";
import { localDateString, parseISODate } from "../utils/timezone";

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
  await Promise.all(
    [previous, current].map((period) =>
      generateBiweeklyPayments(period.year, period.biweekNumber).then((result) => {
        if (result.created || result.refreshed) {
          log(
            `boletas Q${period.biweekNumber}/${period.year}: ${result.created} creadas, ${result.refreshed} actualizadas`,
          );
        }
      }),
    ),
  );
});

export const runReminderJob = guarded("reminders", async () => {
  const sent = await dispatchDueReminders();
  if (sent > 0) log(`${sent} recordatorio(s) enviados`);
});

export const runScheduledTerminationsJob = guarded("terminations", async () => {
  const count = await processScheduledTerminations();
  if (count > 0) log(`${count} empleado(s) procesados por finalización programada`);
});

let scheduledJobs: ScheduledTask[] = [];

// Read cron expressions and timezone from env with sensible defaults for Costa Rica
const TZ = process.env.SCHEDULER_TZ || "America/Costa_Rica";
const PAYROLL_CRON = process.env.PAYROLL_SCHEDULE || "0 2 * * *"; // daily 02:00 CR
const REMINDER_CRON = process.env.REMINDER_SCHEDULE || "*/5 * * * *"; // every 5 min
const TERMINATION_CRON = process.env.TERMINATION_SCHEDULE || "0 3 * * *"; // daily 03:00 CR

export const startSchedulers = (): void => {
  if (process.env.NODE_ENV === "test" || process.env.DISABLE_SCHEDULERS === "true") return;
  if (scheduledJobs.length > 0) return;

  // Laptops sleep and wake up — suppress the flood of "missed execution" warnings
  // that node-cron emits for every tick that passed while the process was suspended.
  // Production (always-on) keeps the default logger so real anomalies are visible.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (cron as any).setLogger({ warn: () => {}, error: console.error, info: console.info });
  }

  // Run once at startup (catches up if server was asleep)
  runReminderJob();
  runPayrollJob();
  runScheduledTerminationsJob();

  // Schedule with Costa Rica timezone
  scheduledJobs = [
    cron.schedule(REMINDER_CRON, runReminderJob, { timezone: TZ }),
    cron.schedule(PAYROLL_CRON, runPayrollJob, { timezone: TZ }),
    cron.schedule(TERMINATION_CRON, runScheduledTerminationsJob, { timezone: TZ }),
  ];
};

export const stopSchedulers = (): void => {
  scheduledJobs.forEach((job) => job.stop());
  scheduledJobs = [];
};
