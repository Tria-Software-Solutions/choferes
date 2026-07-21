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
    roleRules: [mockRule],
    roleUpdateRules: [...[mockRule], mockRule],
    roleNameParam: [mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  };
});

// Mock the entire service layer
jest.mock("../services/roleService", () => ({
  getRoles: jest.fn(),
  getRoleById: jest.fn(),
  getRoleByName: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const roleService = require("../services/roleService");
import roleRoutes from "../routes/roleRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/roles", roleRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = roleService as any;

const mockRole = {
  id: 1,
  name: "admin",
  description: "Administrator",
  permissions: [{ id: 1, name: "manage_users" }],
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/roles", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockRole],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getRoles.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/roles");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getRoles.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/roles");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching Roles");
  });
});

describe("GET /api/roles/:id", () => {
  it("debería devolver 200 con el rol", async () => {
    service.getRoleById.mockResolvedValue(mockRole);

    const res = await request(app).get("/api/roles/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRole);
    expect(service.getRoleById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getRoleById.mockResolvedValue(null);

    const res = await request(app).get("/api/roles/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Role not found");
  });
});

describe("GET /api/roles/name/:name", () => {
  it("debería devolver 200 con el rol por nombre", async () => {
    service.getRoleByName.mockResolvedValue(mockRole);

    const res = await request(app).get("/api/roles/name/admin");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRole);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getRoleByName.mockResolvedValue(null);

    const res = await request(app).get("/api/roles/name/nonexistent");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/roles", () => {
  it("debería devolver 201 con el rol creado", async () => {
    const newRole = { name: "editor", description: "Editor role" };
    const createdRole = { id: 2, ...newRole, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    service.createRole.mockResolvedValue(createdRole);

    const res = await request(app).post("/api/roles").send(newRole);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(createdRole);
  });
});

describe("PUT /api/roles/:id", () => {
  it("debería devolver 200 con el rol actualizado", async () => {
    const updateData = { name: "super_admin" };
    service.updateRole.mockResolvedValue({ ...mockRole, name: "super_admin" });

    const res = await request(app).put("/api/roles/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("super_admin");
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateRole.mockResolvedValue(null);

    const res = await request(app).put("/api/roles/999").send({ name: "x" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/roles/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteRole.mockResolvedValue(1);

    const res = await request(app).delete("/api/roles/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteRole.mockResolvedValue(0);

    const res = await request(app).delete("/api/roles/999");

    expect(res.status).toBe(404);
  });
});
