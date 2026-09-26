/** Frontend Payment type — mirrors the backend payments table (boleta quincenal) */

export interface PaymentEmployee {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  avatar?: string | null;
  hourlyRate?: number | null;
}

export type PaymentStatus = "pending" | "sent" | "cancelled";

export interface Payment {
  id: number;
  employeeId: number;
  payPeriod: "biweekly";
  biweekNumber: number;
  year: number;
  payDate?: string | null;
  currency: string;
  regularSalary: number;
  overtimePay: number;
  mileage: number;
  others: number;
  socialCharges: number;
  deductions: number;
  totalPayable: number;
  notes?: string | null;
  status: PaymentStatus;
  emailSentAt?: string | null;
  isManual: boolean;
  createdAt?: string;
  updatedAt?: string;
  employee?: PaymentEmployee;
}

/** Editable amount fields of a payment (total is always recomputed server-side). */
export interface PaymentAmounts {
  regularSalary: number;
  overtimePay: number;
  mileage: number;
  others: number;
  socialCharges: number;
  deductions: number;
}

/** Server-side breakdown preview (GET /payments/recalculate/...). */
export interface PaymentBreakdown extends PaymentAmounts {
  employeeId: number;
  biweekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  hoursWorked: number;
  hourlyRate: number | null;
  totalPayable: number;
}
