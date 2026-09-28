// Route guards of the "Tareas" API: each verb needs its own permission.
import express from "express";
import request from "supertest";

let mockPermissions: string[] = [];

jest.mock("../middleware/authMiddleware", () => ({
  authenticateToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as unknown as { user: unknown }).user = { id: 5, roles: [], permissions: mockPermissions };
    next();
  },
}));

jest.mock("../services/taskService", () => ({
  getTasks: jest.fn().mockResolvedValue([]),
  createTask: jest.fn().mockResolvedValue({ id: 1, title: "Nueva" }),
  updateTask: jest.fn().mockResolvedValue({ task: { id: 1 }, next: null }),
  deleteTask: jest.fn().mockResolvedValue(true),
  getLists: jest.fn().mockResolvedValue([]),
}));

// eslint-disable-next-line import/first
import { taskRouter, taskListRouter } from "../routes/taskRoutes";

const app = express();
app.use(express.json());
app.use("/api/tasks", taskRouter);
app.use("/api/task-lists", taskListRouter);

describe("permisos de la API de tareas", () => {
  it("rechaza con 403 a quien no tiene tasks:view", async () => {
    mockPermissions = [];
    expect((await request(app).get("/api/tasks")).status).toBe(403);
    expect((await request(app).get("/api/task-lists")).status).toBe(403);
  });

  it("permite ver con tasks:view pero no crear sin tasks:create", async () => {
    mockPermissions = ["tasks:view"];
    expect((await request(app).get("/api/tasks")).status).toBe(200);
    expect((await request(app).post("/api/tasks").send({ title: "Nueva" })).status).toBe(403);
  });

  it("exige tasks:edit para editar y tasks:delete para borrar", async () => {
    mockPermissions = ["tasks:view", "tasks:create"];
    expect((await request(app).put("/api/tasks/1").send({ title: "x" })).status).toBe(403);
    expect((await request(app).delete("/api/tasks/1")).status).toBe(403);

    mockPermissions = ["tasks:view", "tasks:edit", "tasks:delete"];
    expect((await request(app).put("/api/tasks/1").send({ title: "x" })).status).toBe(200);
    expect((await request(app).delete("/api/tasks/1")).status).toBe(204);
  });
});
