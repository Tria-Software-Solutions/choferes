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
  scheduleDays?: ScheduleDay[];
  createdAt?: string;
  updatedAt?: string;
}
