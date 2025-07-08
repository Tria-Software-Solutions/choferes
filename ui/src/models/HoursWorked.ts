export interface HoursWorked {
  id: number;
  employeeId: number;
  date: Date | string;
  scheduleId?: number;
}
