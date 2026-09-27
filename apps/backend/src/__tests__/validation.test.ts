import express from "express";
import request from "supertest";
import { disciplinaryRules, notificationRules, validate } from "../middleware/validation";

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
      .send({ ...base, actionUrl: "/employees/12?tab=pagos" });

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
