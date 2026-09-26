/** Frontend Vacation type — mirrors the backend vacations table */

export interface VacationEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  avatar?: string | null;
  vacationDays?: number | null;
}

export interface VacationApprover {
  id: number;
  firstName: string;
  lastName: string;
}

export type VacationStatus = "pending" | "approved" | "rejected";

export interface Vacation {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  daysRequested: number;
  status: VacationStatus;
  reason?: string | null;
  approvedBy?: number | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: VacationEmployee;
  approvedByUser?: VacationApprover | null;
}
