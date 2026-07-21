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
    userUpdateRules: [mockRule],
    userStatusUpdateRules: [mockRule],
    userPasswordUpdateRules: [mockRule],
    userTemporalPasswordUpdateRules: [mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) => next()),
  };
});

// Mock the entire service layer
jest.mock("../services/userService", () => ({
  authenticateUser: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserByUsername: jest.fn(),
  getUserPermissions: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  updateUserStatus: jest.fn(),
  updateUserPassword: jest.fn(),
  updateUserTemporalPassword: jest.fn(),
  deleteUser: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const userService = require("../services/userService");
import userRoutes from "../routes/userRoutes";
import { createTestApp } from "./helpers/testApp";

const app = createTestApp("/api/users", userRoutes);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = userService as any;

const mockUser = {
  id: 1,
  firstName: "Admin",
  lastName: "Sistema",
  username: "admin",
  email: "admin@example.com",
  isActive: true,
  roles: [{ id: 1, name: "admin", permissions: [{ id: 1, name: "manage_users" }] }],
  createdAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/users/login", () => {
  it("debería devolver 200 con tokens y permisos", async () => {
    const loginResult = {
      user: mockUser,
      accessToken: "token123",
      refreshToken: "refresh123",
    };
    service.authenticateUser.mockResolvedValue(loginResult);

    const res = await request(app)
      .post("/api/users/login")
      .send({ identifier: "admin", password: "pass123" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("token123");
    expect(res.body.userPermissions).toEqual(["manage_users"]);
  });

  it("debería devolver 400 si faltan credenciales", async () => {
    const res = await request(app).post("/api/users/login").send({ identifier: "admin" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Credenciales incompletas");
  });

  it("debería devolver 401 si usuario no encontrado", async () => {
    service.authenticateUser.mockRejectedValue(new Error("User not found"));

    const res = await request(app)
      .post("/api/users/login")
      .send({ identifier: "unknown", password: "pass" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Usuario no encontrado");
  });

  it("debería devolver 401 si usuario está inactivo", async () => {
    service.authenticateUser.mockRejectedValue(new Error("User is inactive"));

    const res = await request(app)
      .post("/api/users/login")
      .send({ identifier: "inactive", password: "pass" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Usuario desactivado");
  });

  it("debería devolver 401 si contraseña incorrecta", async () => {
    service.authenticateUser.mockRejectedValue(new Error("Incorrect password"));

    const res = await request(app)
      .post("/api/users/login")
      .send({ identifier: "admin", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Contraseña incorrecta");
  });
});

describe("GET /api/users", () => {
  it("debería devolver 200 con lista paginada", async () => {
    const paginatedResult = {
      data: [mockUser],
      pagination: { page: 1, limit: 50, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    };
    service.getUsers.mockResolvedValue(paginatedResult);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(paginatedResult);
  });

  it("debería devolver 500 si el service falla", async () => {
    service.getUsers.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error fetching Users");
  });
});

describe("GET /api/users/:id", () => {
  it("debería devolver 200 con el usuario", async () => {
    service.getUserById.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);
    expect(service.getUserById).toHaveBeenCalledWith(1);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getUserById.mockResolvedValue(null);

    const res = await request(app).get("/api/users/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});

describe("GET /api/users/email/:email", () => {
  it("debería devolver 200 con el usuario por email", async () => {
    service.getUserByEmail.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/email/admin@example.com");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getUserByEmail.mockResolvedValue(null);

    const res = await request(app).get("/api/users/email/nonexistent@example.com");

    expect(res.status).toBe(404);
  });
});

describe("GET /api/users/username/:username", () => {
  it("debería devolver 200 con el usuario por username", async () => {
    service.getUserByUsername.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/users/username/admin");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUser);
  });
});

describe("GET /api/users/:id/permissions", () => {
  it("debería devolver 200 con los permisos del usuario", async () => {
    service.getUserPermissions.mockResolvedValue(["manage_users", "view_reports"]);

    const res = await request(app).get("/api/users/1/permissions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(["manage_users", "view_reports"]);
  });

  it("debería devolver 404 si no existe", async () => {
    service.getUserPermissions.mockResolvedValue(null);

    const res = await request(app).get("/api/users/999/permissions");

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/users/:id", () => {
  it("debería devolver 200 con el usuario actualizado", async () => {
    const updateData = { firstName: "Actualizado" };
    service.updateUser.mockResolvedValue({ ...mockUser, firstName: "Actualizado" });

    const res = await request(app).put("/api/users/1").send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Actualizado");
  });

  it("debería devolver 404 si no existe", async () => {
    service.updateUser.mockResolvedValue(null);

    const res = await request(app).put("/api/users/999").send({ firstName: "Test" });

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/users/:id/status", () => {
  it("debería devolver 200 con el estado actualizado", async () => {
    service.updateUserStatus.mockResolvedValue({ ...mockUser, isActive: false });

    const res = await request(app).put("/api/users/1/status").send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });
});

describe("PUT /api/users/:id/password", () => {
  it("debería devolver 200 con contraseña actualizada", async () => {
    service.updateUserPassword.mockResolvedValue(mockUser);

    const res = await request(app).put("/api/users/1/password").send({ password: "new_pass" });

    expect(res.status).toBe(200);
    expect(service.updateUserPassword).toHaveBeenCalledWith(1, "new_pass");
  });
});

describe("PUT /api/users/:id/temporal-password", () => {
  it("debería devolver 200 con contraseña temporal actualizada", async () => {
    service.updateUserTemporalPassword.mockResolvedValue(mockUser);

    const res = await request(app).put("/api/users/1/temporal-password").send({ temporalPassword: "temp_pass" });

    expect(res.status).toBe(200);
    expect(service.updateUserTemporalPassword).toHaveBeenCalledWith(1, "temp_pass");
  });
});

describe("DELETE /api/users/:id", () => {
  it("debería devolver 204 si se elimina correctamente", async () => {
    service.deleteUser.mockResolvedValue(1);

    const res = await request(app).delete("/api/users/1");

    expect(res.status).toBe(204);
  });

  it("debería devolver 404 si no existe", async () => {
    service.deleteUser.mockResolvedValue(0);

    const res = await request(app).delete("/api/users/999");

    expect(res.status).toBe(404);
  });
});
