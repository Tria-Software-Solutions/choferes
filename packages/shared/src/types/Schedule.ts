export interface ScheduleDay {
  id: number;
  scheduleId: number;
  day: string;
  hours: number;
}

export interface Schedule {
  id: number;
  days: string[];
  label: string;
  hours: number;
  specialSchedule: boolean;
  scheduleDays?: ScheduleDay[];
  createdAt?: string;
  updatedAt?: string;
}
