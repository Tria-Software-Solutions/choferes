import request from "supertest";
import express from "express";

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn(
    (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      (req as any).user = { id: 1, roles: ["*"], permissions: ["*"] };
      next();
    },
  ),
}));

// Mock validation middleware
jest.mock("../middleware/validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRule: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockRule as any).run = jest.fn();
  return {
    idParam: [mockRule],
    permissionNamesParam: [mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
    ),
  };
});

// Mock the entire service layer
jest.mock("../services/permissionService", () => ({
  getPermissions: jest.fn(),
  getPermissionById: jest.fn(),
  getPermissionsByNames: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const permissionService = require("../services/permissionService");
import permissionRoutes from "../routes/permissionRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/permissions", permissionRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = permissionService as any;

const mockPermission = {
  id: 1,
  code: "employees:view",
  module: "Empleados",
  name: "Ver Empleados",
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/permissions", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockPermission],
      pagination: {
        page: 1,
        limit: 50,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    service.getPermissions.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/permissions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getPermissions.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/permissions");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching Permissions");
  });
});

describe("GET /api/permissions/:id", () => {
  it("debería devolver 200 con el permiso", async () => {
    service.getPermissionById.mockResolvedValue(mockPermission);

    const res = await request(app).get("/api/permissions/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockPermission);
    expect(service.getPermissionById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getPermissionById.mockResolvedValue(null);

    const res = await request(app).get("/api/permissions/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Permission not found");
  });
});

describe("GET /api/permissions/names/:names", () => {
  it("debería devolver 200 con permisos por nombres", async () => {
    service.getPermissionsByNames.mockResolvedValue([mockPermission]);

    const res = await request(app).get("/api/permissions/names/Ver%20Empleados");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockPermission]);
    expect(service.getPermissionsByNames).toHaveBeenCalledWith(["Ver Empleados"]);
  });

  it("debería devolver 404 si no encuentra permisos", async () => {
    service.getPermissionsByNames.mockResolvedValue([]);

    const res = await request(app).get("/api/permissions/names/nonexistent1,nonexistent2");

    expect(res.status).toBe(404);
  });
});
