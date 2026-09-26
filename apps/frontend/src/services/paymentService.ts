import { Payment, PaymentBreakdown } from "../models/Payment";
import api, { invalidateCache } from "./api";
import { PaginatedResult } from "@choferes/shared";

export interface PaymentQuery {
  employeeId?: number;
  year?: number;
  biweekNumber?: number;
  status?: string;
  page?: number;
  limit?: number;
}

// Paginated list of payments (newest period first).
export const getPayments = async (
  params: PaymentQuery = {},
): Promise<PaginatedResult<Payment>> => {
  const response = await api.get("/payments", {
    params: { _t: Date.now(), limit: 10000, ...params },
  });
  return response.data;
};

export const getPaymentById = async (id: number): Promise<Payment> => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

// Server-side breakdown preview: hours worked in the period × hourlyRate.
export const getPaymentBreakdown = async (
  employeeId: number,
  biweekNumber: number,
  year: number,
): Promise<PaymentBreakdown> => {
  const response = await api.get(
    `/payments/recalculate/${employeeId}/${biweekNumber}/${year}`,
  );
  return response.data;
};

// Creates the payment; amount fields act as manual overrides (isManual=true).
export const createPayment = async (input: {
  employeeId: number;
  biweekNumber: number;
  year: number;
  payDate?: string | null;
  notes?: string | null;
  overtimePay?: number;
  mileage?: number;
  others?: number;
  socialCharges?: number;
  deductions?: number;
  regularSalary?: number;
}): Promise<Payment> => {
  const response = await api.post("/payments", input);
  invalidateCache("/payments");
  return response.data;
};

// Partial edit; amount changes recompute the total and flag isManual=true.
export const updatePayment = async (
  id: number,
  input: {
    payDate?: string | null;
    notes?: string | null;
    status?: "pending" | "cancelled";
    regularSalary?: number;
    overtimePay?: number;
    mileage?: number;
    others?: number;
    socialCharges?: number;
    deductions?: number;
  },
): Promise<Payment> => {
  const response = await api.put(`/payments/${id}`, input);
  invalidateCache("/payments");
  return response.data;
};

// Recomputes regularSalary from hours × hourlyRate, keeping optional amounts.
export const recalculatePayment = async (id: number): Promise<Payment> => {
  const response = await api.post(`/payments/${id}/recalculate`);
  invalidateCache("/payments");
  return response.data;
};

// Sends the boleta by email with the client-generated PDF attached.
export const sendPaymentEmail = async (
  id: number,
  body: { pdfBase64?: string | null; pdfFileName?: string | null },
): Promise<Payment> => {
  const response = await api.post(`/payments/${id}/email`, body);
  invalidateCache("/payments");
  return response.data;
};

export const deletePayment = async (id: number): Promise<number> => {
  await api.delete(`/payments/${id}`);
  invalidateCache("/payments");
  return id;
};
