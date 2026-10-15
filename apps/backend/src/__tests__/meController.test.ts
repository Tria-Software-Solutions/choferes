import request from "supertest";
import express from "express";

// Autenticación simulada: un empleado con solo `my-panel:view` (sin
// `documents:view`), que es justo el caso que cubre este endpoint.
jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: jest.fn(
    (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      (req as any).user = { id: 5, roles: ["Chofer"], permissions: ["my-panel:view"] };
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
    allowSelfWithPermission: jest.fn(pass),
    getUserId: (req: express.Request) => (req as any).user?.id,
  };
});

jest.mock("../services/meService", () => ({
  getMyOverview: jest.fn(),
  createMyVacation: jest.fn(),
  updateMyProfile: jest.fn(),
  getMyDocuments: jest.fn(),
  getMyDocument: jest.fn(),
  getMyLicenseRequests: jest.fn(),
  createMyLicenseRequest: jest.fn(),
}));

import * as meService from "../services/meService";
import meRoutes from "../routes/meRoutes";
import { createTestApp } from "./helpers/testApp";
import { ServiceError } from "../utils/errors";

const app = createTestApp("/api/me", meRoutes);
const service = meService as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/me/documents/:id", () => {
  it("devuelve el archivo visible para el usuario autenticado", async () => {
    service.getMyDocument.mockResolvedValue({
      id: 7,
      name: "compartido.txt",
      data: "data:text/plain;base64,SGVsbG8=",
    });

    const res = await request(app).get("/api/me/documents/7");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 7, name: "compartido.txt" });
    expect(service.getMyDocument).toHaveBeenCalledWith(5, 7);
  });

  it("404 cuando el archivo no es visible para el usuario", async () => {
    service.getMyDocument.mockRejectedValue(new ServiceError(404, "Archivo no encontrado"));

    const res = await request(app).get("/api/me/documents/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Archivo no encontrado");
  });
});
