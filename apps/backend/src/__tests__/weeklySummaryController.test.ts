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
jest.mock("../services/weeklySummaryService", () => ({
  getWeeklySummaries: jest.fn(),
  getCurrentWeeklySummary: jest.fn(),
  hasWorkedCurrenWeeklySummary: jest.fn(),
  createWeeklySummary: jest.fn(),
  updateWeeklySummary: jest.fn(),
  deleteWeeklySummary: jest.fn(),
  deleteAllWeeklySummaries: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const weeklySummaryService = require("../services/weeklySummaryService");
import weeklySummaryRoutes from "../routes/weeklySummaryRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/weekly-summaries", weeklySummaryRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = weeklySummaryService as any;

const mockSummary = {
  id: 1,
  employeeId: 1,
  weekNumber: 29,
  month: 7,
  year: 2026,
  totalHours: 40,
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/weekly-summaries", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockSummary],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getWeeklySummaries.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/weekly-summaries");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getWeeklySummaries.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/weekly-summaries");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching WeeklySummaries");
  });
});

describe("GET /api/weekly-summaries/employee/:id", () => {
  it("debería devolver 200 con el resumen semanal", async () => {
    service.getCurrentWeeklySummary.mockResolvedValue(mockSummary);

    const res = await request(app).get("/api/weekly-summaries/employee/1?weekNumber=29&year=2026");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSummary);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getCurrentWeeklySummary.mockResolvedValue(null);

    const res = await request(app).get("/api/weekly-summaries/employee/999?weekNumber=1&year=2025");

    expect(res.status).toBe(404);
  });
});

describe("GET /api/weekly-summaries/employee/:id/has-worked", () => {
  it("debería devolver true si trabajó", async () => {
    service.hasWorkedCurrenWeeklySummary.mockResolvedValue(true);

    const res = await request(app).get("/api/weekly-summaries/employee/1/has-worked?weekNumber=29&month=7&year=2026");

    expect(res.status).toBe(200);
    expect(res.body.hasWorked).toBe(true);
  });

  it("debería devolver false si no trabajó", async () => {
    service.hasWorkedCurrenWeeklySummary.mockResolvedValue(false);

    const res = await request(app).get("/api/weekly-summaries/employee/1/has-worked?weekNumber=99&month=1&year=2025");

    expect(res.status).toBe(200);
    expect(res.body.hasWorked).toBe(false);
  });
});

describe("POST /api/weekly-summaries", () => {
  it("debería devolver 201 con el resumen creado", async () => {
    const newData = { employeeId: 1, weekNumber: 30, month: 7, year: 2026, totalHours: 45 };
    const created = { id: 2, ...newData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createWeeklySummary.mockResolvedValue(created);

    const res = await request(app).post("/api/weekly-summaries").send(newData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });
});

describe("PUT /api/weekly-summaries/:id", () => {
  it("debería devolver 200 con el resumen actualizado", async () => {
    const updateData = { totalHours: 50 };
    service.updateWeeklySummary.mockResolvedValue({ ...mockSummary, totalHours: 50 });

    const res = await request(app).put("/api/weekly-summaries/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.totalHours).toBe(50);
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateWeeklySummary.mockResolvedValue(null);

    const res = await request(app).put("/api/weekly-summaries/999").send({ totalHours: 50 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/weekly-summaries/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteWeeklySummary.mockResolvedValue(1);

    const res = await request(app).delete("/api/weekly-summaries/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteWeeklySummary.mockResolvedValue(0);

    const res = await request(app).delete("/api/weekly-summaries/999");

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/weekly-summaries/bulk", () => {
  it("debería devolver 204 al eliminar todos", async () => {
    service.deleteAllWeeklySummaries.mockResolvedValue(10);

    const res = await request(app).delete("/api/weekly-summaries/bulk");

    expect(res.status).toBe(204);
  });
});
