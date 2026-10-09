import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("../models/User", () => {
  const mock = { findByPk: jest.fn() };
  return { __esModule: true, User: mock, default: mock };
});
jest.mock("../models/Role", () => ({ __esModule: true, Role: {}, default: {} }));
jest.mock("../models/Permission", () => ({ __esModule: true, Permission: {}, default: {} }));
jest.mock("../services/sessionService", () => ({
  createSession: jest.fn(),
  rotateSession: jest.fn(),
  revokeSession: jest.fn(),
}));

// The auth modules read their secrets at import time; CI has no .env.
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "a".repeat(32);
process.env.JWT_SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH || "b".repeat(32);

/* eslint-disable @typescript-eslint/no-require-imports */
const { User } = require("../models/User");
const sessionService = require("../services/sessionService");
const authRoutes = require("../routes/authRoutes").default;
const { createTestApp } = require("./helpers/testApp");
/* eslint-enable @typescript-eslint/no-require-imports */

const app = createTestApp("/api/auth", authRoutes);
const REFRESH_SECRET = process.env.JWT_SECRET_KEY_REFRESH as string;

const refreshTokenFor = (userId: string, session?: { sid: string; jti: string }) =>
  jwt.sign(
    { userId, type: "refresh", ...(session ? { sid: session.sid, jti: session.jti } : {}) },
    REFRESH_SECRET,
    { expiresIn: "1h" },
  );

beforeEach(() => {
  jest.clearAllMocks();
  sessionService.createSession.mockResolvedValue({ sid: "sid-1", jti: "jti-1" });
});

describe("POST /api/auth/refresh-token", () => {
  it("emite nuevos tokens para un usuario activo", async () => {
    User.findByPk.mockResolvedValue({ id: 7, isActive: true });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshTokenFor("7")}`);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it("no renueva la sesión de un usuario desactivado", async () => {
    User.findByPk.mockResolvedValue({ id: 7, isActive: false });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshTokenFor("7")}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("USER_UNAVAILABLE");
    expect(res.body).not.toHaveProperty("accessToken");
  });

  it("no renueva la sesión de un usuario eliminado", async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshTokenFor("7")}`);

    expect(res.status).toBe(401);
  });

  it("rechaza un token firmado con otra clave", async () => {
    const forged = jwt.sign({ userId: "7" }, "another-secret-another-secret-123456");

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${forged}`);

    expect(res.status).toBe(403);
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("rota la sesión cuando el token lleva sid/jti válidos", async () => {
    User.findByPk.mockResolvedValue({ id: 7, isActive: true, tokenVersion: 0 });
    sessionService.rotateSession.mockResolvedValue({
      status: "rotated",
      sid: "sid-1",
      jti: "jti-2",
      userId: 7,
    });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshTokenFor("7", { sid: "sid-1", jti: "jti-1" })}`);

    expect(res.status).toBe(200);
    expect(sessionService.rotateSession).toHaveBeenCalledWith("sid-1", "jti-1");
  });

  it("revoca la sesión al reutilizar un refresh token rotado", async () => {
    User.findByPk.mockResolvedValue({ id: 7, isActive: true, tokenVersion: 0 });
    sessionService.rotateSession.mockResolvedValue({ status: "invalid" });

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .set("Authorization", `Bearer ${refreshTokenFor("7", { sid: "sid-1", jti: "old" })}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("SESSION_REVOKED");
  });
});

describe("POST /api/auth/logout", () => {
  it("expira las cookies de sesión", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(204);
    const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
    expect(cookies.some((c) => c.startsWith("accessToken=;"))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken=;"))).toBe(true);
  });

  it("revoca server-side la sesión del refresh token enviado", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${refreshTokenFor("7", { sid: "sid-9", jti: "j" })}`);

    expect(res.status).toBe(204);
    expect(sessionService.revokeSession).toHaveBeenCalledWith("sid-9");
  });
});
