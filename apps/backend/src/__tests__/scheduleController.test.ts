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
    scheduleRules: [mockRule],
    scheduleUpdateRules: [...[mockRule], mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  };
});

// Mock the entire service layer
jest.mock("../services/scheduleService", () => ({
  getSchedules: jest.fn(),
  getScheduleById: jest.fn(),
  createSchedule: jest.fn(),
  updateSchedule: jest.fn(),
  deleteSchedule: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const scheduleService = require("../services/scheduleService");
import scheduleRoutes from "../routes/scheduleRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/schedules", scheduleRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = scheduleService as any;

const mockSchedule = {
  id: 1,
  label: "Diurno",
  days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  hours: 8,
  specialSchedule: false,
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/schedules", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockSchedule],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getSchedules.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/schedules");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getSchedules.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/schedules");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching Schedules");
  });
});

describe("GET /api/schedules/:id", () => {
  it("debería devolver 200 con el horario", async () => {
    service.getScheduleById.mockResolvedValue(mockSchedule);

    const res = await request(app).get("/api/schedules/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSchedule);
    expect(service.getScheduleById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getScheduleById.mockResolvedValue(null);

    const res = await request(app).get("/api/schedules/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Schedule not found");
  });
});

describe("POST /api/schedules", () => {
  it("debería devolver 201 con el horario creado", async () => {
    const newSchedule = { label: "Nocturno", days: ["monday", "tuesday", "wednesday", "thursday", "friday"], hours: 6, specialSchedule: false };
    const createdSchedule = { id: 2, ...newSchedule, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createSchedule.mockResolvedValue(createdSchedule);

    const res = await request(app).post("/api/schedules").send(newSchedule);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdSchedule);
  });

  it("debería devolver 500 si la creación falla", async () => {
    service.createSchedule.mockRejectedValue(new Error("Create error"));

    const res = await request(app).post("/api/schedules").send({ label: "Test" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error creating Schedule");
  });
});

describe("PUT /api/schedules/:id", () => {
  it("debería devolver 200 con el horario actualizado", async () => {
    const updateData = { hours: 10 };
    service.updateSchedule.mockResolvedValue({ ...mockSchedule, hours: 10 });

    const res = await request(app).put("/api/schedules/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.hours).toBe(10);
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateSchedule.mockResolvedValue(null);

    const res = await request(app).put("/api/schedules/999").send({ hours: 10 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/schedules/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteSchedule.mockResolvedValue(1);

    const res = await request(app).delete("/api/schedules/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteSchedule.mockResolvedValue(0);

    const res = await request(app).delete("/api/schedules/999");

    expect(res.status).toBe(404);
  });
});
