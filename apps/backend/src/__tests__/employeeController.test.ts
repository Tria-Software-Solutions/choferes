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
    employeeRules: [mockRule],
    employeeUpdateRules: [...[mockRule], mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  };
});

// Mock the entire service layer
jest.mock("../services/employeeService", () => ({
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  createEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const employeeService = require("../services/employeeService");
import employeeRoutes from "../routes/employeeRoutes";
import { createTestApp } from "./helpers/testApp";

// Matches the real server mount: app.use("/api/employees", employeeRoutes)
const app = createTestApp("/api/employees", employeeRoutes);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = employeeService as any;

const mockEmployee = {
  id: 1,
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/employees", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockEmployee],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getEmployees.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/employees");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
    expect(service.getEmployees).toHaveBeenCalledTimes(1);
  });

  it("debería pasar query params al service", async () => {
    service.getEmployees.mockResolvedValue({
      data: [],
      pagination: { page: 2, limit: 10, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: true },
    });

    await request(app).get("/api/employees?page=2&limit=10&search=juan");

    expect(service.getEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ page: "2", limit: "10", search: "juan" }),
    );
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getEmployees.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/employees");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching Employees");
  });
});

describe("GET /api/employees/:id", () => {
  it("debería devolver 200 con el empleado", async () => {
    service.getEmployeeById.mockResolvedValue(mockEmployee);

    const res = await request(app).get("/api/employees/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockEmployee);
    expect(service.getEmployeeById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getEmployeeById.mockResolvedValue(null);

    const res = await request(app).get("/api/employees/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Employee not found");
  });
});

describe("POST /api/employees", () => {
  it("debería devolver 201 con el empleado creado", async () => {
    const newEmployee = { firstName: "María", lastName: "García", email: "maria@example.com" };
    const createdEmployee = { id: 2, ...newEmployee, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createEmployee.mockResolvedValue(createdEmployee);

    const res = await request(app).post("/api/employees").send(newEmployee);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdEmployee);
    expect(service.createEmployee).toHaveBeenCalledWith(newEmployee);
  });

  it("debería devolver 500 si la creación falla", async () => {
    service.createEmployee.mockRejectedValue(new Error("Create error"));

    const res = await request(app).post("/api/employees").send({ firstName: "Test" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error creating Employee");
  });
});

describe("PUT /api/employees/:id", () => {
  it("debería devolver 200 con el empleado actualizado", async () => {
    const updateData = { firstName: "Juan Carlos" };
    const updatedEmployee = { ...mockEmployee, firstName: "Juan Carlos" };

    service.updateEmployee.mockResolvedValue(updatedEmployee);

    const res = await request(app).put("/api/employees/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedEmployee);
    expect(service.updateEmployee).toHaveBeenCalledWith(1, updateData);
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateEmployee.mockResolvedValue(null);

    const res = await request(app).put("/api/employees/999").send({ firstName: "Test" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Employee not found");
  });
});

describe("DELETE /api/employees/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteEmployee.mockResolvedValue(1);

    const res = await request(app).delete("/api/employees/1");

    expect(res.status).toBe(204);
    expect(service.deleteEmployee).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteEmployee.mockResolvedValue(0);

    const res = await request(app).delete("/api/employees/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Employee not found");
  });
});
