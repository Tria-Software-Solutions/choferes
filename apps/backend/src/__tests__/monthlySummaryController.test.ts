import request from "supertest";
import express from "express";

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).user = { id: 1 };
    next();
  }),
}));

// Mock validation middleware
jest.mock("../middleware/validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRule: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockRule as any).run = jest.fn();
  return {
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  };
});

// Mock the entire service layer
jest.mock("../services/monthlySummaryService", () => ({
  getMonthlySummaries: jest.fn(),
  getCurrentMonthlySummary: jest.fn(),
  createMonthlySummary: jest.fn(),
  updateMonthlySummary: jest.fn(),
  deleteMonthlySummary: jest.fn(),
  deleteAllMonthlySummaries: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const monthlySummaryService = require("../services/monthlySummaryService");
import monthlySummaryRoutes from "../routes/monthlySummaryRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/monthly-summaries", monthlySummaryRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = monthlySummaryService as any;

const mockSummary = {
  id: 1,
  employeeId: 1,
  month: 7,
  year: 2026,
  totalHours: 160,
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/monthly-summaries", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockSummary],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getMonthlySummaries.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/monthly-summaries");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getMonthlySummaries.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/monthly-summaries");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching MonthlySummaries");
  });
});

describe("GET /api/monthly-summaries/employee/:id", () => {
  it("debería devolver 200 con el resumen mensual", async () => {
    service.getCurrentMonthlySummary.mockResolvedValue(mockSummary);

    const res = await request(app).get("/api/monthly-summaries/employee/1?month=7&year=2026");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSummary);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getCurrentMonthlySummary.mockResolvedValue(null);

    const res = await request(app).get("/api/monthly-summaries/employee/999?month=12&year=2025");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/monthly-summaries", () => {
  it("debería devolver 201 con el resumen creado", async () => {
    const newData = { employeeId: 1, month: 8, year: 2026, totalHours: 170 };
    const created = { id: 2, ...newData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createMonthlySummary.mockResolvedValue(created);

    const res = await request(app).post("/api/monthly-summaries").send(newData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });
});

describe("PUT /api/monthly-summaries/:id", () => {
  it("debería devolver 200 con el resumen actualizado", async () => {
    const updateData = { totalHours: 180 };
    service.updateMonthlySummary.mockResolvedValue({ ...mockSummary, totalHours: 180 });

    const res = await request(app).put("/api/monthly-summaries/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.totalHours).toBe(180);
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateMonthlySummary.mockResolvedValue(null);

    const res = await request(app).put("/api/monthly-summaries/999").send({ totalHours: 180 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/monthly-summaries/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteMonthlySummary.mockResolvedValue(1);

    const res = await request(app).delete("/api/monthly-summaries/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteMonthlySummary.mockResolvedValue(0);

    const res = await request(app).delete("/api/monthly-summaries/999");

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/monthly-summaries/bulk", () => {
  it("debería devolver 204 al eliminar todos", async () => {
    service.deleteAllMonthlySummaries.mockResolvedValue(12);

    const res = await request(app).delete("/api/monthly-summaries/bulk");

    expect(res.status).toBe(204);
  });
});
