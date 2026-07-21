import request from "supertest";
import express from "express";

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).user = { id: 1 };
    next();
  }),
}));

// Mock the entire service layer — validation is NOT used in userRoleRoutes (except POST / has NO auth)
jest.mock("../services/userRoleService", () => ({
  getUserRoles: jest.fn(),
  getUserRoleByUserId: jest.fn(),
  getUserRoleByRoleId: jest.fn(),
  createUserRole: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUserRole: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const userRoleService = require("../services/userRoleService");
import userRoleRoutes from "../routes/userRoleRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/user-roles", userRoleRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = userRoleService as any;

const mockUserRole = {
  id: 1,
  userId: 1,
  roleId: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/user-roles", () => {
  it("debería devolver 200 con todas las asignaciones", async () => {
    service.getUserRoles.mockResolvedValue([mockUserRole]);

    const res = await request(app).get("/api/user-roles");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockUserRole]);
  });

  it("debería devolver 400 si el service falla", async () => {
    service.getUserRoles.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/user-roles");

    expect(res.status).toBe(400);
  });
});

describe("GET /api/user-roles/userId/:userId", () => {
  it("debería devolver 200 con la asignación del usuario", async () => {
    service.getUserRoleByUserId.mockResolvedValue(mockUserRole);

    const res = await request(app).get("/api/user-roles/userId/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUserRole);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getUserRoleByUserId.mockResolvedValue(null);

    const res = await request(app).get("/api/user-roles/userId/999");

    expect(res.status).toBe(404);
  });
});

describe("GET /api/user-roles/roleId/:roleId", () => {
  it("debería devolver 200 con la asignación del rol", async () => {
    service.getUserRoleByRoleId.mockResolvedValue(mockUserRole);

    const res = await request(app).get("/api/user-roles/roleId/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUserRole);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getUserRoleByRoleId.mockResolvedValue(null);

    const res = await request(app).get("/api/user-roles/roleId/999");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/user-roles", () => {
  it("debería devolver 201 con la asignación creada (sin auth)", async () => {
    const newData = { userId: 2, roleId: 2 };
    const created = { id: 2, ...newData };

    service.createUserRole.mockResolvedValue(created);

    const res = await request(app).post("/api/user-roles").send(newData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });

  it("debería devolver 400 si la creación falla", async () => {
    service.createUserRole.mockRejectedValue(new Error("Create error"));

    const res = await request(app).post("/api/user-roles").send({ userId: 999, roleId: 999 });

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/user-roles/:id", () => {
  it("debería devolver 200 con la asignación actualizada", async () => {
    service.updateUserRole.mockResolvedValue({ ...mockUserRole, roleId: 2 });

    const res = await request(app).put("/api/user-roles/1").send({ roleId: 2 });

    expect(res.status).toBe(200);
    expect(res.body.roleId).toBe(2);
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateUserRole.mockResolvedValue(null);

    const res = await request(app).put("/api/user-roles/999").send({ roleId: 2 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/user-roles/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteUserRole.mockResolvedValue(1);

    const res = await request(app).delete("/api/user-roles/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteUserRole.mockResolvedValue(0);

    const res = await request(app).delete("/api/user-roles/999");

    expect(res.status).toBe(404);
  });
});
