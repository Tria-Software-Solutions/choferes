import type { Schedule } from "../models/Schedule";

/**
 * Returns the hours for a specific schedule on a specific day.
 * Checks scheduleDays first (per-day hours), falls back to schedule.hours (legacy).
 */
export function getScheduleHours(schedule: Schedule | null | undefined, day: string): number {
  if (!schedule) return 0;

  // Normalize day to lowercase for comparison with scheduleDays
  const normalizedDay = day.toLowerCase();

  // Try per-day hours first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scheduleDays = (schedule as any).scheduleDays;
  if (scheduleDays && Array.isArray(scheduleDays) && scheduleDays.length > 0) {
    const dayEntry = scheduleDays.find(
      (sd: { day: string; hours: number }) => sd.day.toLowerCase() === normalizedDay,
    );
    // If scheduleDays is configured but day not found, return 0 (the schedule doesn't cover this day)
    if (dayEntry) return dayEntry.hours;
    return 0;
  }

  // Fallback to legacy single hours value (no scheduleDays configured)
  return schedule.hours || 0;
}

/**
 * Sorts schedules: normal first (alphabetically), then special (alphabetically).
 * If orderByIds is provided, uses that custom order instead.
 * Used everywhere schedules are displayed to ensure consistent ordering.
 */
export function sortSchedulesByType<T extends { label: string; id: number }>(
  list: T[],
  orderByIds?: number[],
): T[] {
  const arr = [...list];

  if (orderByIds && orderByIds.length > 0) {
    // Use custom order; items not in the custom order go to the end
    const ordered: T[] = [];
    const remaining: T[] = [];

    for (const item of arr) {
      if (orderByIds.includes(item.id)) {
        ordered.push(item);
      } else {
        remaining.push(item);
      }
    }

    // Sort ordered items by the custom order
    ordered.sort((a, b) => orderByIds.indexOf(a.id) - orderByIds.indexOf(b.id));
    // Sort remaining items alphabetically
    remaining.sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

    return [...ordered, ...remaining];
  }

  // Default: alphabetical order
  return arr.sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
}

/**
 * Builds a scheduleDays array from a schedule + days + hours configuration.
 * Used when creating/updating schedules with per-day hours.
 */
export function buildScheduleDays(
  days: string[],
  defaultHours: number,
  dayHoursOverrides?: Record<string, string | number>,
): Array<{ day: string; hours: number }> {
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return daysOfWeek
    .filter((day) => days.includes(day))
    .map((day) => ({
      day,
      hours: dayHoursOverrides?.[day] !== undefined
        ? Number(dayHoursOverrides[day])
        : defaultHours,
    }));
}
