import request from "supertest";
import express from "express";

// Mock auth middleware — sets the authenticated user
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn(
    (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).user = { id: 9, roles: ["*"], permissions: ["*"] };
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
    vacationRules: [mockRule],
    vacationUpdateRules: [mockRule],
    vacationQueryRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
    ),
  };
});

jest.mock("../services/vacationService", () => ({
  getVacations: jest.fn(),
  getVacationById: jest.fn(),
  createVacation: jest.fn(),
  updateVacation: jest.fn(),
  deleteVacation: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const vacationService = require("../services/vacationService");
import vacationRoutes from "../routes/vacationRoutes";
import { createTestApp } from "./helpers/testApp";
import { ServiceError } from "../utils/errors";

const app = createTestApp("/api/vacations", vacationRoutes);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = vacationService as any;

const mockVacation = {
  id: 1,
  employeeId: 7,
  startDate: "2026-10-05",
  endDate: "2026-10-09",
  daysRequested: 5,
  status: "pending",
  reason: "Viaje",
  approvedBy: null,
  approvedAt: null,
  employee: { id: 7, firstName: "Juan", lastName: "Pérez", vacationDays: 10 },
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

describe("GET /api/vacations", () => {
  it("debería devolver 200 con la lista paginada", async () => {
    service.getVacations.mockResolvedValue(paginated([mockVacation]));

    const res = await request(app).get("/api/vacations");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(service.getVacations).toHaveBeenCalledWith(
      expect.objectContaining({}),
    );
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getVacations.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/vacations");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching vacations");
  });
});

describe("GET /api/vacations/:id", () => {
  it("debería devolver 200 con la solicitud", async () => {
    service.getVacationById.mockResolvedValue(mockVacation);

    const res = await request(app).get("/api/vacations/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockVacation);
    expect(service.getVacationById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getVacationById.mockResolvedValue(null);

    const res = await request(app).get("/api/vacations/999");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/vacations", () => {
  it("debería devolver 201 con la solicitud creada", async () => {
    service.createVacation.mockResolvedValue(mockVacation);

    const res = await request(app).post("/api/vacations").send({
      employeeId: 7,
      startDate: "2026-10-05",
      endDate: "2026-10-09",
      reason: "Viaje",
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockVacation);
  });

  it("debería devolver 400 ante error de dominio (rango inválido)", async () => {
    service.createVacation.mockRejectedValue(
      new ServiceError(400, "La fecha final no puede ser anterior a la inicial"),
    );

    const res = await request(app).post("/api/vacations").send({
      employeeId: 7,
      startDate: "2026-10-09",
      endDate: "2026-10-05",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("fecha final");
  });

  it("debería devolver 404 si el empleado no existe", async () => {
    service.createVacation.mockRejectedValue(new ServiceError(404, "Empleado no encontrado"));

    const res = await request(app).post("/api/vacations").send({
      employeeId: 999,
      startDate: "2026-10-05",
      endDate: "2026-10-09",
    });

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/vacations/:id", () => {
  it("debería inyectar el usuario autenticado como approvedBy", async () => {
    const approved = { ...mockVacation, status: "approved", approvedBy: 9 };
    service.updateVacation.mockResolvedValue(approved);

    const res = await request(app).put("/api/vacations/1").send({ status: "approved" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
    expect(service.updateVacation).toHaveBeenCalledWith(1, {
      status: "approved",
      approvedBy: 9,
    });
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateVacation.mockResolvedValue(null);

    const res = await request(app).put("/api/vacations/999").send({ status: "rejected" });

    expect(res.status).toBe(404);
  });

  it("debería devolver 400 si el saldo es insuficiente", async () => {
    service.updateVacation.mockRejectedValue(
      new ServiceError(400, "Saldo de vacaciones insuficiente: 3 días disponibles, se requieren 5"),
    );

    const res = await request(app).put("/api/vacations/1").send({ status: "approved" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Saldo de vacaciones insuficiente");
  });
});

describe("DELETE /api/vacations/:id", () => {
  it("debería devolver 204 si se elimina", async () => {
    service.deleteVacation.mockResolvedValue(true);

    const res = await request(app).delete("/api/vacations/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteVacation.mockResolvedValue(false);

    const res = await request(app).delete("/api/vacations/999");

    expect(res.status).toBe(404);
  });
});
