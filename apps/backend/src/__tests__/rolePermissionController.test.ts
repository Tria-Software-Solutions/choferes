import request from "supertest";
import express from "express";

// Mock auth middleware
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as any).user = { id: 1 };
    next();
  }),
}));

// Mock the entire service layer — validation is NOT used in rolePermissionRoutes
jest.mock("../services/rolePermissionService", () => ({
  getRolePermissions: jest.fn(),
  createRolePermission: jest.fn(),
  updateRolePermission: jest.fn(),
  deleteRolePermission: jest.fn(),
  getRolePermissionsByRoleId: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const rolePermissionService = require("../services/rolePermissionService");
import rolePermissionRoutes from "../routes/rolePermissionRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/role-permissions", rolePermissionRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = rolePermissionService as any;

const mockRolePermission = {
  id: 1,
  roleId: 1,
  permissionId: 1,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/role-permissions", () => {
  it("debería devolver 200 con todas las asignaciones", async () => {
    service.getRolePermissions.mockResolvedValue([mockRolePermission]);

    const res = await request(app).get("/api/role-permissions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockRolePermission]);
  });

  it("debería devolver 400 si el service falla", async () => {
    service.getRolePermissions.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/role-permissions");

    expect(res.status).toBe(400);
  });
});

describe("POST /api/role-permissions", () => {
  it("debería devolver 201 con la asignación creada", async () => {
    const newData = { roleId: 1, permissionId: 2 };
    const created = { id: 2, ...newData };

    service.createRolePermission.mockResolvedValue(created);

    const res = await request(app).post("/api/role-permissions").send(newData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
  });
});

describe("PUT /api/role-permissions/:id", () => {
  it("debería devolver 200 con los permisos actualizados", async () => {
    service.updateRolePermission.mockResolvedValue([{ roleId: 1, permissionId: 1 }, { roleId: 1, permissionId: 2 }]);

    const res = await request(app).put("/api/role-permissions/1").send({ permissionIds: [1, 2] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("debería devolver 400 si permissionIds no es array", async () => {
    const res = await request(app).put("/api/role-permissions/1").send({ permissionIds: "not-an-array" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Permission Ids must be an array");
  });
});

describe("DELETE /api/role-permissions/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteRolePermission.mockResolvedValue(1);

    const res = await request(app).delete("/api/role-permissions/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteRolePermission.mockResolvedValue(0);

    const res = await request(app).delete("/api/role-permissions/999");

    expect(res.status).toBe(404);
  });
});

describe("GET /api/role-permissions/role/:roleId", () => {
  it("debería devolver 200 con permisos del rol", async () => {
    service.getRolePermissionsByRoleId.mockResolvedValue([mockRolePermission]);

    const res = await request(app).get("/api/role-permissions/role/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockRolePermission]);
  });

  it("debería devolver 400 si roleId es inválido", async () => {
    const res = await request(app).get("/api/role-permissions/role/invalid");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid roleId");
  });
});
