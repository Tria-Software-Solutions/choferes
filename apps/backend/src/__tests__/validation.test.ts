import express from "express";
import request from "supertest";
import {
  disciplinaryRules,
  notificationRules,
  userRules,
  userUpdateRules,
  validate,
} from "../middleware/validation";

const appWith = (rules: express.RequestHandler[]) => {
  const app = express();
  app.use(express.json());
  app.post("/", ...rules, validate, (_req, res) => res.status(204).end());
  return app;
};

describe("disciplinaryRules › attachments", () => {
  const app = appWith(disciplinaryRules as unknown as express.RequestHandler[]);
  const base = {
    employeeId: 1,
    actionDate: "2026-09-01",
    type: "llamada_atencion",
    reason: "Llegada tardía",
  };
  const withAttachment = (dataUrl: string) => ({
    ...base,
    attachments: [{ name: "a", mimeType: "image/png", size: 10, dataUrl }],
  });

  it("acepta un archivo base64 real", async () => {
    const res = await request(app)
      .post("/")
      .send(withAttachment("data:image/png;base64,iVBORw0KGgo="));

    expect(res.status).toBe(204);
  });

  it.each([
    "javascript:alert(document.cookie)",
    "data:text/html,<script>alert(1)</script>",
    "https://evil.example/file.pdf",
  ])("rechaza %s (se abriría en la sesión de quien lo descargue)", async (dataUrl) => {
    const res = await request(app).post("/").send(withAttachment(dataUrl));

    expect(res.status).toBe(400);
  });
});

describe("notificationRules › actionUrl", () => {
  const app = appWith(notificationRules as unknown as express.RequestHandler[]);
  const base = { title: "Aviso", message: "Mensaje" };

  it("acepta rutas internas", async () => {
    const res = await request(app)
      .post("/")
      .send({ ...base, actionUrl: "/employees/12?tab=payments" });

    expect(res.status).toBe(204);
  });

  it.each(["https://evil.example", "//evil.example", "javascript:alert(1)"])(
    "rechaza %s",
    async (actionUrl) => {
      const res = await request(app)
        .post("/")
        .send({ ...base, actionUrl });

      expect(res.status).toBe(400);
    },
  );
});

describe("username rules › acepta los usernames que la app genera", () => {
  const base = {
    firstName: "Admin",
    lastName: "Test",
    email: "admin@example.com",
    password: "Abc1234!",
    roleId: 2,
  };
  const createApp = appWith(userRules as unknown as express.RequestHandler[]);
  const updateApp = (() => {
    const app = express();
    app.use(express.json());
    app.put("/:id", ...(userUpdateRules as unknown as express.RequestHandler[]), validate, (_req, res) =>
      res.status(204).end(),
    );
    return app;
  })();

  it.each(["empleado-16", "luis.herrera_506", "danilumix", "usr-1.x_y"])(
    "acepta %s al crear",
    async (username) => {
      const res = await request(createApp).post("/").send({ ...base, username });

      expect(res.status).toBe(204);
    },
  );

  it("acepta usernames con guiones al actualizar", async () => {
    const res = await request(updateApp)
      .put("/1")
      .send({ username: "empleado-16" });

    expect(res.status).toBe(204);
  });

  it("rechaza un username que no empieza con letra", async () => {
    const res = await request(createApp).post("/").send({ ...base, username: "1empleado" });

    expect(res.status).toBe(400);
  });

  it("rechaza espacios en el username", async () => {
    const res = await request(createApp).post("/").send({ ...base, username: "mi usuario" });

    expect(res.status).toBe(400);
  });
});
