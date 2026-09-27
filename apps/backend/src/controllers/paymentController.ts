// Controller for HTTP requests related to payments (boleta quincenal).
import { Request, Response } from "express";
import * as paymentService from "../services/paymentService";
import * as paymentCalculationService from "../services/paymentCalculationService";
import * as emailService from "../services/emailService";
import { isServiceError, sendServerError } from "../utils/errors";
import { getBiweeklyDates } from "../services/summaryRecalculationService";

// Last day of the quincena (YYYY-MM-DD): the "PERIODO" printed on the slip.
const periodEndDate = (biweekNumber: number, year: number): string => {
  const { endDate } = getBiweeklyDates(year, biweekNumber);
  return `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(
    endDate.getDate(),
  ).padStart(2, "0")}`;
};

const handleError = (res: Response, error: unknown, fallbackMessage: string): Response => {
  if (isServiceError(error)) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  return sendServerError(res, fallbackMessage, error);
};

// GET /payments — paginated list with employee identity
export const getPayments = async (req: Request, res: Response) => {
  try {
    const result = await paymentService.getPayments(req.query as Record<string, string>);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error fetching payments");
  }
};

// GET /payments/:id — single payment with employee
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = await paymentService.getPaymentById(id);
    if (payment) {
      return res.status(200).json(payment);
    }
    return res.status(404).json({ message: "Payment not found" });
  } catch (error) {
    return handleError(res, error, "Error fetching payment");
  }
};

// GET /payments/recalculate/:employeeId/:biweekNumber/:year — breakdown preview
export const previewBreakdown = async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const biweekNumber = parseInt(req.params.biweekNumber, 10);
    const year = parseInt(req.params.year, 10);

    const breakdown = await paymentCalculationService.calculateBiweeklyBreakdown(
      employeeId,
      biweekNumber,
      year,
    );
    return res.status(200).json(breakdown);
  } catch (error) {
    return handleError(res, error, "Error calculating payment breakdown");
  }
};

// POST /payments — create with server-side calculation
export const createPayment = async (req: Request, res: Response) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    return res.status(201).json(payment);
  } catch (error) {
    return handleError(res, error, "Error creating payment");
  }
};

// PUT /payments/:id — manual edits (amounts recompute the total)
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = await paymentService.updatePayment(id, req.body);
    if (payment) {
      return res.status(200).json(payment);
    }
    return res.status(404).json({ message: "Payment not found" });
  } catch (error) {
    return handleError(res, error, "Error updating payment");
  }
};

// POST /payments/:id/recalculate — recompute from hours × hourlyRate
export const recalculatePayment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = await paymentService.recalculatePayment(id);
    if (payment) {
      return res.status(200).json(payment);
    }
    return res.status(404).json({ message: "Payment not found" });
  } catch (error) {
    return handleError(res, error, "Error recalculating payment");
  }
};

// POST /payments/generate — fills the slips of a quincena for every employee
// who worked in it (idempotent; pending slips are refreshed, manual edits kept)
export const generatePeriodPayments = async (req: Request, res: Response) => {
  try {
    const { year, biweekNumber } = req.body as { year: number; biweekNumber: number };
    const result = await paymentService.generateBiweeklyPayments(
      Number(year),
      Number(biweekNumber),
    );
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error, "Error generating payments");
  }
};

// DELETE /payments/:id
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await paymentService.deletePayment(id);
    if (deleted) {
      return res.status(204).end();
    }
    return res.status(404).json({ message: "Payment not found" });
  } catch (error) {
    return handleError(res, error, "Error deleting payment");
  }
};

// POST /payments/:id/email — sends the verified boleta (with its PDF) by email
export const sendPaymentEmail = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = await paymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const employee = payment.employee as
      { firstName: string; lastName: string; email?: string | null } | undefined;
    if (!employee?.email) {
      return res
        .status(400)
        .json({ message: "El empleado no tiene un correo electrónico registrado" });
    }

    const { pdfBase64, pdfFileName } = req.body as {
      pdfBase64?: string | null;
      pdfFileName?: string | null;
    };

    await emailService.sendPaymentSlipEmail({
      to: employee.email,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      biweekNumber: payment.biweekNumber,
      year: payment.year,
      periodEnd: periodEndDate(payment.biweekNumber, payment.year),
      currency: payment.currency,
      regularSalary: payment.regularSalary,
      overtimePay: payment.overtimePay,
      mileage: payment.mileage,
      others: payment.others,
      socialCharges: payment.socialCharges,
      deductions: payment.deductions,
      totalPayable: payment.totalPayable,
      pdfBase64: pdfBase64 || null,
      pdfFileName: pdfFileName || undefined,
    });

    const updated = await paymentService.markPaymentSent(id);
    return res.status(200).json(updated);
  } catch (error) {
    return handleError(res, error, "Error sending payment email");
  }
};
