/** Frontend ScheduleDay type — mirrors @choferes/shared with optional id/scheduleId for creation */
export interface ScheduleDay {
  id?: number;
  scheduleId?: number;
  day: string;
  hours: number;
}

/** Frontend Schedule type — mirrors @choferes/shared */
export interface Schedule {
  id: number;
  days: string[];
  label: string;
  hours: number;
  scheduleDays?: ScheduleDay[];
  createdAt?: string;
  updatedAt?: string;
}
