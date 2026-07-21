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
    idParam: [mockRule],
    hoursWorkedRules: [mockRule],
    hoursWorkedUpdateRules: [...[mockRule], mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  };
});

// Mock the entire service layer
jest.mock("../services/hoursWorkedService", () => ({
  getHoursWorked: jest.fn(),
  getHoursWorkedById: jest.fn(),
  createHoursWorked: jest.fn(),
  updateHoursWorked: jest.fn(),
  deleteHoursWorked: jest.fn(),
  deleteAllHoursWorked: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const hoursWorkedService = require("../services/hoursWorkedService");
import hoursWorkedRoutes from "../routes/hoursWorkedRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/hours-worked", hoursWorkedRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = hoursWorkedService as any;

const mockHoursWorked = {
  id: 1,
  employeeId: 1,
  date: "2026-07-20T00:00:00.000Z",
  scheduleId: 1,
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/hours-worked", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockHoursWorked],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getHoursWorked.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/hours-worked");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getHoursWorked.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/hours-worked");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching HoursWorked");
  });
});

describe("GET /api/hours-worked/:id", () => {
  it("debería devolver 200 con el registro", async () => {
    service.getHoursWorkedById.mockResolvedValue(mockHoursWorked);

    const res = await request(app).get("/api/hours-worked/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockHoursWorked);
    expect(service.getHoursWorkedById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getHoursWorkedById.mockResolvedValue(null);

    const res = await request(app).get("/api/hours-worked/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("HoursWorked entry not found");
  });
});

describe("POST /api/hours-worked", () => {
  it("debería devolver 201 con el registro creado", async () => {
    const newData = { employeeId: 1, date: "2026-07-21", scheduleId: 2 };
    const created = { id: 2, ...newData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createHoursWorked.mockResolvedValue(created);

    const res = await request(app).post("/api/hours-worked").send(newData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });

  it("debería devolver 500 si la creación falla", async () => {
    service.createHoursWorked.mockRejectedValue(new Error("Create error"));

    const res = await request(app).post("/api/hours-worked").send({ employeeId: 1 });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error creating HoursWorked");
  });
});

describe("PUT /api/hours-worked/:id", () => {
  it("debería devolver 200 con el registro actualizado", async () => {
    const updateData = { scheduleId: 3 };
    service.updateHoursWorked.mockResolvedValue({ ...mockHoursWorked, scheduleId: 3 });

    const res = await request(app).put("/api/hours-worked/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.scheduleId).toBe(3);
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateHoursWorked.mockResolvedValue(null);

    const res = await request(app).put("/api/hours-worked/999").send({ scheduleId: 3 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/hours-worked/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteHoursWorked.mockResolvedValue(1);

    const res = await request(app).delete("/api/hours-worked/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteHoursWorked.mockResolvedValue(0);

    const res = await request(app).delete("/api/hours-worked/999");

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/hours-worked/bulk", () => {
  it("debería devolver 204 al eliminar todos", async () => {
    service.deleteAllHoursWorked.mockResolvedValue(10);

    const res = await request(app).delete("/api/hours-worked/bulk");

    expect(res.status).toBe(204);
    expect(service.deleteAllHoursWorked).toHaveBeenCalled();
  });
});
