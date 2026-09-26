import request from "supertest";
import express from "express";

// Mock auth middleware — sets the authenticated user
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn(
    (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).user = { id: 1, roles: ["*"], permissions: ["*"] };
      next();
    },
  ),
}));

jest.mock("../middleware/authorize", () => {
  const pass = () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
    next();
  return {
    requirePermission: jest.fn(pass),
    requireAnyPermission: jest.fn(pass),
    requireRole: jest.fn(pass),
    allowSelfOrPermission: jest.fn(pass),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getUserId: (req: express.Request) => (req as any).user?.id as number,
  };
});

// Mock validation middleware — rules are ARRAYS, validate is a function
jest.mock("../middleware/validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRule: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockRule as any).run = jest.fn();
  return {
    idParam: [mockRule],
    paymentRules: [mockRule],
    paymentUpdateRules: [mockRule],
    paymentQueryRules: [mockRule],
    paymentEmailRules: [mockRule],
    biweekParams: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
    ),
  };
});

jest.mock("../services/paymentService", () => ({
  getPayments: jest.fn(),
  getPaymentById: jest.fn(),
  createPayment: jest.fn(),
  updatePayment: jest.fn(),
  recalculatePayment: jest.fn(),
  deletePayment: jest.fn(),
  markPaymentSent: jest.fn(),
}));

jest.mock("../services/paymentCalculationService", () => ({
  calculateBiweeklyBreakdown: jest.fn(),
}));

jest.mock("../services/emailService", () => ({
  sendPaymentSlipEmail: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const paymentService = require("../services/paymentService");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const paymentCalculationService = require("../services/paymentCalculationService");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const emailService = require("../services/emailService");
import paymentRoutes from "../routes/paymentRoutes";
import { createTestApp } from "./helpers/testApp";
import { ServiceError } from "../utils/errors";

const app = createTestApp("/api/payments", paymentRoutes);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = paymentService as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calculation = paymentCalculationService as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const email = emailService as any;

const mockPayment = {
  id: 1,
  employeeId: 7,
  payPeriod: "biweekly",
  biweekNumber: 17,
  year: 2026,
  payDate: null,
  currency: "CRC",
  regularSalary: 32000,
  overtimePay: 0,
  mileage: 0,
  others: 0,
  socialCharges: 0,
  deductions: 0,
  totalPayable: 32000,
  notes: null,
  status: "pending",
  emailSentAt: null,
  isManual: false,
  employee: { id: 7, firstName: "Juan", lastName: "Pérez", email: "juan@example.com" },
};

const paginated = (data: unknown[]) => ({
  data,
  pagination: {
    page: 1,
    limit: 50,
    totalItems: data.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/payments", () => {
  it("debería devolver 200 con la lista paginada", async () => {
    service.getPayments.mockResolvedValue(paginated([mockPayment]));

    const res = await request(app).get("/api/payments");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(service.getPayments).toHaveBeenCalledTimes(1);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getPayments.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/payments");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching payments");
  });
});

describe("GET /api/payments/recalculate/:employeeId/:biweekNumber/:year", () => {
  it("debería devolver el desglose calculado", async () => {
    const breakdown = {
      employeeId: 7,
      biweekNumber: 17,
      year: 2026,
      hoursWorked: 16,
      hourlyRate: 2000,
      regularSalary: 32000,
      totalPayable: 32000,
    };
    calculation.calculateBiweeklyBreakdown.mockResolvedValue(breakdown);

    const res = await request(app).get("/api/payments/recalculate/7/17/2026");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(breakdown);
    expect(calculation.calculateBiweeklyBreakdown).toHaveBeenCalledWith(7, 17, 2026);
  });

  it("debería devolver 404 si el empleado no existe", async () => {
    calculation.calculateBiweeklyBreakdown.mockRejectedValue(
      new ServiceError(404, "Empleado no encontrado"),
    );

    const res = await request(app).get("/api/payments/recalculate/999/1/2026");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Empleado no encontrado");
  });
});

describe("POST /api/payments", () => {
  it("debería devolver 201 con el pago creado", async () => {
    service.createPayment.mockResolvedValue(mockPayment);

    const res = await request(app)
      .post("/api/payments")
      .send({ employeeId: 7, biweekNumber: 17, year: 2026 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockPayment);
  });

  it("debería devolver 409 si la quincena ya tiene pago", async () => {
    service.createPayment.mockRejectedValue(
      new ServiceError(409, "Ya existe un pago para ese empleado en esa quincena"),
    );

    const res = await request(app)
      .post("/api/payments")
      .send({ employeeId: 7, biweekNumber: 17, year: 2026 });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Ya existe un pago");
  });

  it("debería devolver 500 si la creación falla", async () => {
    service.createPayment.mockRejectedValue(new Error("Create error"));

    const res = await request(app)
      .post("/api/payments")
      .send({ employeeId: 7, biweekNumber: 17, year: 2026 });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error creating payment");
  });
});

describe("PUT /api/payments/:id", () => {
  it("debería devolver 200 con el pago actualizado", async () => {
    const updated = { ...mockPayment, overtimePay: 5000, totalPayable: 37000 };
    service.updatePayment.mockResolvedValue(updated);

    const res = await request(app).put("/api/payments/1").send({ overtimePay: 5000 });

    expect(res.status).toBe(200);
    expect(service.updatePayment).toHaveBeenCalledWith(1, { overtimePay: 5000 });
  });

  it("debería devolver 404 si no existe", async () => {
    service.updatePayment.mockResolvedValue(null);

    const res = await request(app).put("/api/payments/999").send({ notes: "x" });

    expect(res.status).toBe(404);
  });

  it("debería devolver 400 ante un error de dominio", async () => {
    service.updatePayment.mockRejectedValue(
      new ServiceError(400, "Solo los estados 'pending' y 'cancelled' se pueden editar manualmente"),
    );

    const res = await request(app).put("/api/payments/1").send({ status: "sent" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/payments/:id/recalculate", () => {
  it("debería devolver 200 con el pago recalculado", async () => {
    const recalculated = { ...mockPayment, isManual: false };
    service.recalculatePayment.mockResolvedValue(recalculated);

    const res = await request(app).post("/api/payments/1/recalculate");

    expect(res.status).toBe(200);
    expect(res.body.isManual).toBe(false);
  });

  it("debería devolver 404 si no existe", async () => {
    service.recalculatePayment.mockResolvedValue(null);

    const res = await request(app).post("/api/payments/999/recalculate");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/payments/:id/email", () => {
  it("debería enviar el correo y marcar el pago como enviado", async () => {
    const sent = { ...mockPayment, status: "sent", emailSentAt: "2026-09-25T12:00:00.000Z" };
    service.getPaymentById.mockResolvedValue(mockPayment);
    email.sendPaymentSlipEmail.mockResolvedValue(undefined);
    service.markPaymentSent.mockResolvedValue(sent);

    const res = await request(app)
      .post("/api/payments/1/email")
      .send({ pdfBase64: "JVBERi0xLjQK", pdfFileName: "boleta.pdf" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("sent");
    expect(email.sendPaymentSlipEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "juan@example.com",
        employeeName: "Juan Pérez",
        biweekNumber: 17,
        year: 2026,
        totalPayable: 32000,
        pdfBase64: "JVBERi0xLjQK",
        pdfFileName: "boleta.pdf",
      }),
    );
    expect(service.markPaymentSent).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si el pago no existe", async () => {
    service.getPaymentById.mockResolvedValue(null);

    const res = await request(app).post("/api/payments/999/email").send({});

    expect(res.status).toBe(404);
  });

  it("debería devolver 400 si el empleado no tiene correo", async () => {
    service.getPaymentById.mockResolvedValue({
      ...mockPayment,
      employee: { id: 7, firstName: "Juan", lastName: "Pérez", email: null },
    });

    const res = await request(app).post("/api/payments/1/email").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("no tiene un correo");
    expect(email.sendPaymentSlipEmail).not.toHaveBeenCalled();
  });

  it("debería propagar 503 si el servicio de correo no está configurado", async () => {
    service.getPaymentById.mockResolvedValue(mockPayment);
    email.sendPaymentSlipEmail.mockRejectedValue(
      new ServiceError(503, "Servicio de correo no configurado: falta RESEND_API_KEY en el entorno"),
    );

    const res = await request(app).post("/api/payments/1/email").send({});

    expect(res.status).toBe(503);
    expect(res.body.message).toContain("RESEND_API_KEY");
    expect(service.markPaymentSent).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/payments/:id", () => {
  it("debería devolver 204 si se elimina", async () => {
    service.deletePayment.mockResolvedValue(true);

    const res = await request(app).delete("/api/payments/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deletePayment.mockResolvedValue(false);

    const res = await request(app).delete("/api/payments/999");

    expect(res.status).toBe(404);
  });
});
