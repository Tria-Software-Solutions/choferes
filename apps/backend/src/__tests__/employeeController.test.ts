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

// Mock validation middleware — rules are ARRAYS, validate is a function
jest.mock("../middleware/validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRule: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockRule as any).run = jest.fn();
  return {
    idParam: [mockRule],
    employeeRules: [mockRule],
    employeeQueryRules: [mockRule],
    employeeUpdateRules: [...[mockRule], mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
    ),
  };
});

// Mock the entire service layer
jest.mock("../services/employeeService", () => ({
  getEmployees: jest.fn(),
  getEmployeeById: jest.fn(),
  createEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  deleteEmployee: jest.fn(),
  getEmployeeAccess: jest.fn(),
  assignDefaultRoleToEmployeeUser: jest.fn(),
  linkEmployeeToUser: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const employeeService = require("../services/employeeService");
import employeeRoutes from "../routes/employeeRoutes";
import { createTestApp } from "./helpers/testApp";
import { ServiceError } from "../utils/errors";

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
      pagination: {
        page: 1,
        limit: 50,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
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
      pagination: {
        page: 2,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });

    await request(app).get("/api/employees?page=2&limit=10&search=juan");

    // El segundo argumento es el actor: sin él el service no puede saber qué
    // omitir, y el listado se abre también con roles:view.
    expect(service.getEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ page: "2", limit: "10", search: "juan" }),
      expect.objectContaining({ id: 1, permissions: ["*"] }),
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
    expect(service.getEmployeeById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ id: 1, permissions: ["*"] }),
    );
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
    const createdEmployee = {
      id: 2,
      ...newEmployee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
    // El servicio recibe a quien hace el cambio para validar el rol que resulta del puesto.
    expect(service.updateEmployee).toHaveBeenCalledWith(1, updateData, {
      id: 1,
      roles: ["*"],
      permissions: ["*"],
    });
  });

  it("debería responder con el código del servicio cuando el cambio de puesto no está permitido", async () => {
    service.updateEmployee.mockRejectedValue(
      new ServiceError(403, 'No se puede cambiar el puesto: la cuenta pasaría a tener el rol "Supervisor".'),
    );

    const res = await request(app).put("/api/employees/1").send({ position: "supervisor" });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Supervisor");
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

// ─── Activar acceso al sistema ──────────────────────────────────────────────
// Flujo completo a nivel de controller/ruta: verifica la respuesta HTTP y que
// el error de configuración del rol por defecto se propague en vez de crear una
// cuenta sin rol en silencio.
describe("POST /api/employees/:id/link-user (Activar acceso al sistema)", () => {
  const linkResult = { user: { id: 42, username: "ana.soto" }, created: true };

  it("debería devolver 201 con la contraseña temporal cuando la cuenta es nueva", async () => {
    service.linkEmployeeToUser.mockResolvedValue({
      ...linkResult,
      tempPassword: "Tmp#12345678",
    });

    const res = await request(app).post("/api/employees/7/link-user");

    expect(service.linkEmployeeToUser).toHaveBeenCalledWith(7, {
      id: 1,
      roles: ["*"],
      permissions: ["*"],
    });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: "Acceso al sistema creado",
      userId: 42,
      username: "ana.soto",
      tempPassword: "Tmp#12345678",
      created: true,
    });
  });

  it("debería devolver 200 sin contraseña cuando la cuenta ya existía", async () => {
    service.linkEmployeeToUser.mockResolvedValue({ ...linkResult, created: false });

    const res = await request(app).post("/api/employees/7/link-user");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "El empleado ya tiene acceso al sistema",
      userId: 42,
      username: "ana.soto",
      created: false,
    });
    expect(res.body).not.toHaveProperty("tempPassword");
  });

  it("debería propagar el error cuando el rol del puesto no está configurado", async () => {
    service.linkEmployeeToUser.mockRejectedValue(
      new ServiceError(500, 'El rol del puesto "Supervisor" no está configurado'),
    );

    const res = await request(app).post("/api/employees/7/link-user");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('El rol del puesto "Supervisor" no está configurado');
  });
});

describe("GET /api/employees/:id/access", () => {
  it("debería marcar needsRole cuando la cuenta quedó sin rol", async () => {
    service.getEmployeeAccess.mockResolvedValue({
      hasUser: true,
      userId: 42,
      username: "ana.soto",
      roles: [],
      needsRole: true,
    });

    const res = await request(app).get("/api/employees/7/access");

    expect(service.getEmployeeAccess).toHaveBeenCalledWith(7);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ hasUser: true, username: "ana.soto", needsRole: true });
  });

  it("debería devolver 404 cuando el empleado no existe", async () => {
    service.getEmployeeAccess.mockRejectedValue(new ServiceError(404, "Empleado no encontrado"));

    const res = await request(app).get("/api/employees/999/access");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Empleado no encontrado");
  });
});

describe("POST /api/employees/:id/assign-default-role", () => {
  it("debería devolver la cuenta con el rol asignado", async () => {
    service.assignDefaultRoleToEmployeeUser.mockResolvedValue({
      hasUser: true,
      userId: 42,
      username: "ana.soto",
      roles: [{ id: 6, name: "Chofer" }],
      needsRole: false,
    });

    const res = await request(app).post("/api/employees/7/assign-default-role");

    expect(service.assignDefaultRoleToEmployeeUser).toHaveBeenCalledWith(7);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ needsRole: false, roles: [{ id: 6, name: "Chofer" }] });
  });

  it("debería devolver 400 cuando el empleado no tiene cuenta", async () => {
    service.assignDefaultRoleToEmployeeUser.mockRejectedValue(
      new ServiceError(400, "El empleado no tiene una cuenta de acceso al sistema"),
    );

    const res = await request(app).post("/api/employees/7/assign-default-role");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("El empleado no tiene una cuenta de acceso al sistema");
  });
});
