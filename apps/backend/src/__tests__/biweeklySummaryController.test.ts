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
jest.mock("../services/biweeklySummaryService", () => ({
  getBiweeklySummaries: jest.fn(),
  getCurrentBiweeklySummary: jest.fn(),
  createBiweeklySummary: jest.fn(),
  updateBiweeklySummary: jest.fn(),
  deleteBiweeklySummary: jest.fn(),
  deleteAllBiweeklySummaries: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const biweeklySummaryService = require("../services/biweeklySummaryService");
import biweeklySummaryRoutes from "../routes/biweeklySummaryRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/biweekly-summaries", biweeklySummaryRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = biweeklySummaryService as any;

const mockSummary = {
  id: 1,
  employeeId: 1,
  biweekNumber: 1,
  month: 7,
  year: 2026,
  totalHours: 80,
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/biweekly-summaries", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockSummary],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getBiweeklySummaries.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/biweekly-summaries");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getBiweeklySummaries.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/biweekly-summaries");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching BiweeklySummaries");
  });
});

describe("GET /api/biweekly-summaries/employee/:id", () => {
  it("debería devolver 200 con el resumen quincenal", async () => {
    service.getCurrentBiweeklySummary.mockResolvedValue(mockSummary);

    const res = await request(app).get("/api/biweekly-summaries/employee/1?biweekNumber=1&month=7&year=2026");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSummary);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getCurrentBiweeklySummary.mockResolvedValue(null);

    const res = await request(app).get("/api/biweekly-summaries/employee/999?biweekNumber=1&month=1&year=2025");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/biweekly-summaries", () => {
  it("debería devolver 201 con el resumen creado", async () => {
    const newData = { employeeId: 1, biweekNumber: 2, month: 7, year: 2026, totalHours: 85 };
    const created = { id: 2, ...newData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createBiweeklySummary.mockResolvedValue(created);

    const res = await request(app).post("/api/biweekly-summaries").send(newData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });
});

describe("PUT /api/biweekly-summaries/:id", () => {
  it("debería devolver 200 con el resumen actualizado", async () => {
    const updateData = { totalHours: 90 };
    service.updateBiweeklySummary.mockResolvedValue({ ...mockSummary, totalHours: 90 });

    const res = await request(app).put("/api/biweekly-summaries/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.totalHours).toBe(90);
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateBiweeklySummary.mockResolvedValue(null);

    const res = await request(app).put("/api/biweekly-summaries/999").send({ totalHours: 90 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/biweekly-summaries/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteBiweeklySummary.mockResolvedValue(1);

    const res = await request(app).delete("/api/biweekly-summaries/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteBiweeklySummary.mockResolvedValue(0);

    const res = await request(app).delete("/api/biweekly-summaries/999");

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/biweekly-summaries/bulk", () => {
  it("debería devolver 204 al eliminar todos", async () => {
    service.deleteAllBiweeklySummaries.mockResolvedValue(5);

    const res = await request(app).delete("/api/biweekly-summaries/bulk");

    expect(res.status).toBe(204);
  });
});
