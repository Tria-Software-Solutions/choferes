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

jest.mock("../middleware/authorize", () => {
  const pass = () => (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
    next();
  return {
    requirePermission: jest.fn(pass),
    requireAnyPermission: jest.fn(pass),
    requireRole: jest.fn(pass),
    allowSelfOrPermission: jest.fn(pass),
  };
});

// Mock the entire service layer — validation is NOT used in userRoleRoutes (except POST / has NO auth)
jest.mock("../services/userRoleService", () => ({
  getUserRoles: jest.fn(),
  getUserRoleByUserId: jest.fn(),
  getUserRoleByRoleId: jest.fn(),
  getUserRoleById: jest.fn(),
  getRoleIdsByUserId: jest.fn(),
  createUserRole: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUserRole: jest.fn(),
}));

// Grant rules have their own unit tests; here they're controlled per test.
jest.mock("../services/accessGrantService", () => ({
  checkRoleAssignment: jest.fn(),
  checkRoleRemoval: jest.fn(),
}));

// La regla "un supervisor conserva el rol Supervisor" se prueba en positionRoleService.test.ts.
jest.mock("../services/positionRoleService", () => ({
  checkRolesFitEmployeePositions: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const positionRole = require("../services/positionRoleService");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const userRoleService = require("../services/userRoleService");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const accessGrant = require("../services/accessGrantService");
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
  accessGrant.checkRoleAssignment.mockResolvedValue(null);
  accessGrant.checkRoleRemoval.mockResolvedValue(null);
  positionRole.checkRolesFitEmployeePositions.mockResolvedValue(null);
  service.getUserRoleById.mockResolvedValue(mockUserRole);
  service.getRoleIdsByUserId.mockResolvedValue([1, 2]);
});

describe("GET /api/user-roles", () => {
  it("debería devolver 200 con todas las asignaciones", async () => {
    service.getUserRoles.mockResolvedValue([mockUserRole]);

    const res = await request(app).get("/api/user-roles");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([mockUserRole]);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getUserRoles.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/user-roles");

    expect(res.status).toBe(500);
    // Raw error details are never serialized to the client.
    expect(res.body).not.toHaveProperty("error");
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
  it("debería devolver 201 con la asignación creada", async () => {
    const newData = { userId: 2, roleId: 2 };
    const created = { id: 2, ...newData };

    service.createUserRole.mockResolvedValue(created);

    const res = await request(app).post("/api/user-roles").send(newData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(created);
    expect(accessGrant.checkRoleAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      2,
      2,
    );
  });

  it("debería devolver 403 si el rol otorga más permisos de los que tiene el usuario", async () => {
    accessGrant.checkRoleAssignment.mockResolvedValue({ status: 403, message: "No" });

    const res = await request(app).post("/api/user-roles").send({ userId: 2, roleId: 1 });

    expect(res.status).toBe(403);
    expect(service.createUserRole).not.toHaveBeenCalled();
  });

  it("agregar un rol no exige el rol Supervisor (es aditivo)", async () => {
    service.createUserRole.mockResolvedValue({ id: 3, userId: 2, roleId: 5 });

    const res = await request(app).post("/api/user-roles").send({ userId: 2, roleId: 5 });

    expect(res.status).toBe(201);
    expect(positionRole.checkRolesFitEmployeePositions).not.toHaveBeenCalled();
  });

  it("debería devolver 400 si userId/roleId no son enteros", async () => {
    const res = await request(app).post("/api/user-roles").send({ userId: "x", roleId: 2 });

    expect(res.status).toBe(400);
    expect(service.createUserRole).not.toHaveBeenCalled();
  });

  it("debería devolver 400 si la creación falla", async () => {
    service.createUserRole.mockRejectedValue(new Error("Create error"));

    const res = await request(app).post("/api/user-roles").send({ userId: 999, roleId: 999 });

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/user-roles/:id", () => {
  it("debería devolver 409 sin cambiar nada si el empleado supervisor perdería el rol Supervisor", async () => {
    positionRole.checkRolesFitEmployeePositions.mockResolvedValue({
      status: 409,
      message: 'debe tener el rol "Supervisor"',
    });

    const res = await request(app).put("/api/user-roles/1").send({ roleId: 7 });

    expect(res.status).toBe(409);
    expect(positionRole.checkRolesFitEmployeePositions).toHaveBeenCalledWith(1, [7]);
    expect(service.updateUserRole).not.toHaveBeenCalled();
  });

  it("acepta una lista de roles y la valida completa", async () => {
    service.updateUserRole.mockResolvedValue({ ...mockUserRole, roleId: 2 });

    const res = await request(app).put("/api/user-roles/1").send({ roleIds: [2, 3] });

    expect(res.status).toBe(200);
    expect(accessGrant.checkRoleAssignment).toHaveBeenCalledTimes(2);
    expect(positionRole.checkRolesFitEmployeePositions).toHaveBeenCalledWith(1, [2, 3]);
    expect(service.updateUserRole).toHaveBeenCalledWith(1, [2, 3]);
  });

  it("rechaza listas con ids inválidos", async () => {
    const res = await request(app).put("/api/user-roles/1").send({ roleIds: [2, "x"] });

    expect(res.status).toBe(400);
    expect(service.updateUserRole).not.toHaveBeenCalled();
  });

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

  it("no permite cambiar el propio rol", async () => {
    accessGrant.checkRoleAssignment.mockResolvedValue({
      status: 403,
      message: "No puedes cambiar tu propio rol",
    });

    const res = await request(app).put("/api/user-roles/1").send({ roleId: 2 });

    expect(res.status).toBe(403);
    expect(service.updateUserRole).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/user-roles/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteUserRole.mockResolvedValue(1);

    const res = await request(app).delete("/api/user-roles/1");

    expect(res.status).toBe(204);
    expect(accessGrant.checkRoleRemoval).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      mockUserRole.userId,
      mockUserRole.roleId,
    );
    expect(service.deleteUserRole).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si la asignación no existe", async () => {
    service.getUserRoleById.mockResolvedValue(null);

    const res = await request(app).delete("/api/user-roles/999");

    expect(res.status).toBe(404);
    expect(service.deleteUserRole).not.toHaveBeenCalled();
  });

  it("rechaza quitarse los propios roles", async () => {
    accessGrant.checkRoleRemoval.mockResolvedValue({
      status: 403,
      message: "No puedes quitarte tus propios roles",
    });

    const res = await request(app).delete("/api/user-roles/1");

    expect(res.status).toBe(403);
    expect(service.deleteUserRole).not.toHaveBeenCalled();
  });

  it("rechaza dejar una cuenta sin roles", async () => {
    accessGrant.checkRoleRemoval.mockResolvedValue({
      status: 409,
      message: "Una cuenta debe conservar al menos un rol",
    });

    const res = await request(app).delete("/api/user-roles/1");

    expect(res.status).toBe(409);
    expect(service.deleteUserRole).not.toHaveBeenCalled();
  });

  it("valida que un supervisor conserve el rol Supervisor antes de borrar", async () => {
    service.getRoleIdsByUserId.mockResolvedValue([1]);
    positionRole.checkRolesFitEmployeePositions.mockResolvedValue({
      status: 409,
      message: 'debe tener el rol "Supervisor"',
    });

    const res = await request(app).delete("/api/user-roles/1");

    expect(res.status).toBe(409);
    expect(positionRole.checkRolesFitEmployeePositions).toHaveBeenCalledWith(
      mockUserRole.userId,
      [],
    );
    expect(service.deleteUserRole).not.toHaveBeenCalled();
  });
});
