// La API de roles es exclusiva de Gerencia/Administrativo: el permiso
// "roles:view" por sí solo no habilita la administración.
import express from "express";
import request from "supertest";

let mockRoles: string[] = [];
let mockPermissions: string[] = [];

jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as unknown as { user: unknown }).user = { id: 7, roles: mockRoles, permissions: mockPermissions };
    next();
  },
}));

jest.mock("../middleware/validation", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockRule: any = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockRule as any).run = jest.fn();
  return {
    idParam: [mockRule],
    roleRules: [mockRule],
    roleUpdateRules: [[mockRule], mockRule],
    roleNameParam: [mockRule],
    paginationRules: [mockRule],
    validate: jest.fn((_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
    ),
  };
});

jest.mock("../controllers/roleController", () => ({
  getRoles: jest.fn((_req: express.Request, res: express.Response) => res.status(200).json({ data: [] })),
  getRoleById: jest.fn((_req: express.Request, res: express.Response) => res.status(200).json({})),
  getRoleByName: jest.fn((_req: express.Request, res: express.Response) => res.status(200).json({})),
  createRole: jest.fn((_req: express.Request, res: express.Response) => res.status(201).json({})),
  updateRole: jest.fn((_req: express.Request, res: express.Response) => res.status(200).json({})),
  deleteRole: jest.fn((_req: express.Request, res: express.Response) => res.status(204).send()),
}));

// eslint-disable-next-line import/first
import roleRoutes from "../routes/roleRoutes";

const app = express();
app.use(express.json());
app.use("/api/roles", roleRoutes);

describe("guardas de rol de la API de roles", () => {
  beforeEach(() => {
    mockRoles = [];
    mockPermissions = [];
  });

  it("rechaza con 403 a un rol operativo aunque tenga todos los permisos", async () => {
    mockRoles = ["Supervisor"];
    mockPermissions = [
      "roles:view",
      "roles:create",
      "roles:edit",
      "roles:delete",
    ];

    expect((await request(app).get("/api/roles")).status).toBe(403);
    expect((await request(app).get("/api/roles/1")).status).toBe(403);
    expect((await request(app).post("/api/roles").send({ name: "X" })).status).toBe(403);
    expect((await request(app).put("/api/roles/1").send({ name: "X" })).status).toBe(403);
    expect((await request(app).delete("/api/roles/1")).status).toBe(403);
  });

  it("permite el listado a Gerencia y Administrativo con roles:view", async () => {
    mockPermissions = ["roles:view"];

    mockRoles = ["Gerencia"];
    expect((await request(app).get("/api/roles")).status).toBe(200);

    mockRoles = ["Administrativo"];
    expect((await request(app).get("/api/roles")).status).toBe(200);
  });

  it("sigue exigiendo el permiso a Gerencia para crear/editar/eliminar", async () => {
    mockRoles = ["Gerencia"];

    expect((await request(app).post("/api/roles").send({ name: "X" })).status).toBe(403);
    expect((await request(app).put("/api/roles/1").send({ name: "X" })).status).toBe(403);
    expect((await request(app).delete("/api/roles/1")).status).toBe(403);

    mockPermissions = ["roles:create", "roles:edit", "roles:delete"];
    expect((await request(app).post("/api/roles").send({ name: "X" })).status).toBe(201);
    expect((await request(app).put("/api/roles/1").send({ name: "X" })).status).toBe(200);
    expect((await request(app).delete("/api/roles/1")).status).toBe(204);
  });
});
