jest.mock("../models/AuthSession", () => {
  const mock = { create: jest.fn(), findByPk: jest.fn(), update: jest.fn(), destroy: jest.fn() };
  return { __esModule: true, AuthSession: mock, default: mock };
});

/* eslint-disable @typescript-eslint/no-require-imports */
const { AuthSession } = require("../models/AuthSession");
/* eslint-enable @typescript-eslint/no-require-imports */
import * as sessionService from "../services/sessionService";

const future = () => new Date(Date.now() + 60 * 60 * 1000);

const activeSession = (overrides: Record<string, unknown> = {}) => ({
  id: "sid-1",
  userId: 5,
  refreshJti: "jti-current",
  previousJti: null,
  rotatedAt: null,
  expiresAt: future(),
  revokedAt: null,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  (AuthSession.update as jest.Mock).mockResolvedValue([1, []]);
});

describe("createSession", () => {
  it("crea una sesión con sid y jti distintos", async () => {
    (AuthSession.create as jest.Mock).mockResolvedValue({});

    const session = await sessionService.createSession(5);

    expect(session.sid).toEqual(expect.any(String));
    expect(session.jti).toEqual(expect.any(String));
    expect(session.sid).not.toBe(session.jti);
    expect(AuthSession.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: session.sid, userId: 5, refreshJti: session.jti }),
    );
  });
});

describe("rotateSession", () => {
  it("rota el jti cuando el token presentado es el actual", async () => {
    (AuthSession.findByPk as jest.Mock).mockResolvedValue(activeSession());

    const result = await sessionService.rotateSession("sid-1", "jti-current");

    expect(result.status).toBe("rotated");
    if (result.status === "rotated") {
      expect(result.jti).toEqual(expect.any(String));
      expect(result.jti).not.toBe("jti-current");
    }
    expect(AuthSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ previousJti: "jti-current" }),
      expect.objectContaining({ where: { id: "sid-1", refreshJti: "jti-current" } }),
    );
  });

  it("acepta el jti previo dentro de la ventana de gracia (carrera entre pestañas)", async () => {
    (AuthSession.findByPk as jest.Mock).mockResolvedValue(
      activeSession({ refreshJti: "jti-new", previousJti: "jti-old", rotatedAt: new Date() }),
    );

    const result = await sessionService.rotateSession("sid-1", "jti-old");

    expect(result.status).toBe("rotated");
  });

  it("revoca la sesión al reutilizar un jti previo fuera de la gracia", async () => {
    (AuthSession.findByPk as jest.Mock).mockResolvedValue(
      activeSession({
        refreshJti: "jti-new",
        previousJti: "jti-old",
        rotatedAt: new Date(Date.now() - 10 * 60 * 1000),
      }),
    );

    const result = await sessionService.rotateSession("sid-1", "jti-old");

    expect(result.status).toBe("invalid");
    expect(AuthSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
      { where: { id: "sid-1" } },
    );
  });

  it("rechaza un sid desconocido", async () => {
    (AuthSession.findByPk as jest.Mock).mockResolvedValue(null);

    expect((await sessionService.rotateSession("nope", "jti")).status).toBe("invalid");
  });

  it("rechaza una sesión expirada", async () => {
    (AuthSession.findByPk as jest.Mock).mockResolvedValue(
      activeSession({ expiresAt: new Date(Date.now() - 1000) }),
    );

    expect((await sessionService.rotateSession("sid-1", "jti-current")).status).toBe("invalid");
  });

  it("rechaza una sesión ya revocada", async () => {
    (AuthSession.findByPk as jest.Mock).mockResolvedValue(
      activeSession({ revokedAt: new Date() }),
    );

    expect((await sessionService.rotateSession("sid-1", "jti-current")).status).toBe("invalid");
  });
});

describe("revocation helpers", () => {
  it("revokeSession marca revokedAt", async () => {
    await sessionService.revokeSession("sid-1");
    expect(AuthSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
      { where: { id: "sid-1" } },
    );
  });

  it("revokeAllSessionsForUser revoca solo las activas del usuario", async () => {
    await sessionService.revokeAllSessionsForUser(5);
    expect(AuthSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ revokedAt: expect.any(Date) }),
      { where: { userId: 5, revokedAt: null } },
    );
  });
});
