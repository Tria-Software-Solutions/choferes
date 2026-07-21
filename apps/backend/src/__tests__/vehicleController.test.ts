import request from "supertest";
import express from "express";

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).user = { id: 1 };
    next();
  }),
}));

// Mock validation middleware — rules are ARRAYS, validate is a function
jest.mock("../middleware/validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRule: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockRule as any).run = jest.fn();
  return {
    idParam: [mockRule],
    vehicleRules: [mockRule],
    vehicleUpdateRules: [...[mockRule], mockRule],
    paginationRules: [mockRule],
    vehicleDateQuery: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  };
});

// Mock the entire service layer
jest.mock("../services/vehicleService", () => ({
  getVehicles: jest.fn(),
  getVehicleById: jest.fn(),
  getVehiclesByDate: jest.fn(),
  createVehicle: jest.fn(),
  updateVehicle: jest.fn(),
  deleteVehicle: jest.fn(),
  deleteAllVehicles: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const vehicleService = require("../services/vehicleService");
import vehicleRoutes from "../routes/vehicleRoutes";
import { createTestApp } from "./helpers/testApp";

// Matches the real server mount: app.use("/api/vehicles", vehicleRoutes)
const app = createTestApp("/api/vehicles", vehicleRoutes);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = vehicleService as any;

const mockVehicle = {
  id: 1,
  ticket: "12345",
  licensePlate: "ABC-123",
  brand: "Toyota",
  color: "Rojo",
  parkingLot: "A1",
  notes: "",
  parkingDate: "2026-07-20T00:00:00.000Z",
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/vehicles", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockVehicle],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getVehicles.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/vehicles");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
    expect(service.getVehicles).toHaveBeenCalledTimes(1);
  });

  it("debería pasar query params incluyendo search", async () => {
    service.getVehicles.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    });

    await request(app).get("/api/vehicles?search=ABC&page=1&limit=10");

    expect(service.getVehicles).toHaveBeenCalledWith(
      expect.objectContaining({ search: "ABC", page: "1", limit: "10" }),
    );
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getVehicles.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/vehicles");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching Vehicles");
  });
});

describe("GET /api/vehicles/:id", () => {
  it("debería devolver 200 con el vehículo", async () => {
    service.getVehicleById.mockResolvedValue(mockVehicle);

    const res = await request(app).get("/api/vehicles/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockVehicle);
    expect(service.getVehicleById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getVehicleById.mockResolvedValue(null);

    const res = await request(app).get("/api/vehicles/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Vehicle not found");
  });
});

describe("GET /api/vehicles/by-date", () => {
  it("debería devolver 200 con vehículos de la fecha", async () => {
    service.getVehiclesByDate.mockResolvedValue([mockVehicle]);

    const res = await request(app).get("/api/vehicles/by-date?date=2026-07-20");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockVehicle]);
  });

  it("debería devolver 400 si falta el parámetro date", async () => {
    const res = await request(app).get("/api/vehicles/by-date");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Date parameter is required");
  });

  it("debería devolver 400 si la fecha es inválida", async () => {
    const res = await request(app).get("/api/vehicles/by-date?date=not-a-date");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid date format");
  });
});

describe("POST /api/vehicles", () => {
  it("debería devolver 201 con el vehículo creado", async () => {
    const newVehicle = {
      ticket: "99999", licensePlate: "XYZ-789", brand: "Honda", color: "Azul",
      parkingLot: "B2", notes: "", parkingDate: "2026-07-20T00:00:00.000Z",
    };
    const createdVehicle = { id: 2, ...newVehicle, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createVehicle.mockResolvedValue(createdVehicle);

    const res = await request(app).post("/api/vehicles").send(newVehicle);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdVehicle);
  });

  it("debería devolver 500 si la creación falla", async () => {
    service.createVehicle.mockRejectedValue(new Error("Create error"));

    const res = await request(app).post("/api/vehicles").send({ ticket: "1" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error creating Vehicle");
  });
});

describe("PUT /api/vehicles/:id", () => {
  it("debería devolver 200 con el vehículo actualizado", async () => {
    const updateData = { color: "Negro" };
    const updatedVehicle = { ...mockVehicle, color: "Negro" };

    service.updateVehicle.mockResolvedValue(updatedVehicle);

    const res = await request(app).put("/api/vehicles/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedVehicle);
    expect(service.updateVehicle).toHaveBeenCalledWith(1, expect.objectContaining(updateData));
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateVehicle.mockResolvedValue(null);

    const res = await request(app).put("/api/vehicles/999").send({ color: "Negro" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/vehicles/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteVehicle.mockResolvedValue(1);

    const res = await request(app).delete("/api/vehicles/1");

    expect(res.status).toBe(204);
    expect(service.deleteVehicle).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteVehicle.mockResolvedValue(0);

    const res = await request(app).delete("/api/vehicles/999");

    expect(res.status).toBe(404);
  });
});
