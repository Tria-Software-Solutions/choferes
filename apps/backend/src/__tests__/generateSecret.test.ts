// Mock jsonwebtoken and crypto at module level — intercepts ALL import styles (default, namespace, etc.)
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.mock("crypto", () => ({
  randomBytes: jest.fn(),
}));

// Mock dotenv so env vars aren't overwritten by .env file during module evaluation
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Helper to set env vars for generateSecret module
const setSecretEnv = () => {
  process.env.JWT_SECRET_KEY = "a".repeat(32);
  process.env.JWT_SECRET_KEY_REFRESH = "b".repeat(32);
};

const clearSecretEnv = () => {
  delete process.env.JWT_SECRET_KEY;
  delete process.env.JWT_SECRET_KEY_REFRESH;
  delete process.env.NODE_ENV;
};

// Load the module once for all tests that don't need module-level re-evaluation
setSecretEnv();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const generateSecretModule = require("../utils/generateSecret");

beforeEach(() => {
  jest.clearAllMocks();
  setSecretEnv();
});

afterEach(() => {
  clearSecretEnv();
});

describe("generateSecureSecret", () => {
  it("debería generar un string hex de 64 caracteres", () => {
    const mockBuffer = Buffer.alloc(32, 0xaa);
    (require("crypto").randomBytes as jest.Mock).mockReturnValue(mockBuffer);

    const result = generateSecretModule.generateSecureSecret();

    expect(require("crypto").randomBytes).toHaveBeenCalledWith(32);
    expect(result).toBe(mockBuffer.toString("hex"));
    expect(result.length).toBe(64); // 32 bytes = 64 hex chars
  });

  it("debería generar valores diferentes en llamadas sucesivas", () => {
    (require("crypto").randomBytes as jest.Mock)
      .mockReturnValueOnce(Buffer.alloc(32, 0xaa))
      .mockReturnValueOnce(Buffer.alloc(32, 0xbb));

    const result1 = generateSecretModule.generateSecureSecret();
    const result2 = generateSecretModule.generateSecureSecret();

    expect(result1).not.toBe(result2);
  });
});

describe("validateTokenFormat", () => {
  it("debería devolver true para un JWT válido de 3 partes", () => {
    expect(generateSecretModule.validateTokenFormat("header.payload.signature")).toBe(true);
  });

  it("debería devolver false si el token tiene menos de 3 partes", () => {
    expect(generateSecretModule.validateTokenFormat("header.payload")).toBe(false);
  });

  it("debería devolver false si el token tiene más de 3 partes", () => {
    expect(generateSecretModule.validateTokenFormat("a.b.c.d")).toBe(false);
  });

  it("debería devolver false si el token es vacío", () => {
    expect(generateSecretModule.validateTokenFormat("")).toBe(false);
  });

  it("debería devolver false si el token es null", () => {
    expect(generateSecretModule.validateTokenFormat(null as unknown as string)).toBe(false);
  });

  it("debería devolver false si el token no es string", () => {
    expect(generateSecretModule.validateTokenFormat(123 as unknown as string)).toBe(false);
  });
});

describe("generateTokens", () => {
  it("debería generar accessToken y refreshToken con jwt.sign", () => {
    process.env.NODE_ENV = "development";

    const mockAccessToken = "mock-access-token";
    const mockRefreshToken = "mock-refresh-token";

    (require("jsonwebtoken").sign as jest.Mock)
      .mockReturnValueOnce(mockAccessToken)
      .mockReturnValueOnce(mockRefreshToken);

    const mockRes = { cookie: jest.fn() };

    const result = generateSecretModule.generateTokens("user-123", mockRes as any);

    expect(require("jsonwebtoken").sign).toHaveBeenCalledTimes(2);
    expect(require("jsonwebtoken").sign).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ userId: "user-123", type: "access" }),
      process.env.JWT_SECRET_KEY,
      expect.objectContaining({ expiresIn: "1h", algorithm: "HS256" }),
    );
    expect(require("jsonwebtoken").sign).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ userId: "user-123", type: "refresh" }),
      process.env.JWT_SECRET_KEY_REFRESH,
      expect.objectContaining({ expiresIn: "7d", algorithm: "HS256" }),
    );

    expect(result.accessToken).toBe(mockAccessToken);
    expect(result.refreshToken).toBe(mockRefreshToken);

    expect(mockRes.cookie).toHaveBeenCalledTimes(2);
    expect(mockRes.cookie).toHaveBeenNthCalledWith(
      1, "accessToken", mockAccessToken,
      expect.objectContaining({ httpOnly: true, secure: false, sameSite: "lax", maxAge: 3600 * 1000 }),
    );
    expect(mockRes.cookie).toHaveBeenNthCalledWith(
      2, "refreshToken", mockRefreshToken,
      expect.objectContaining({ httpOnly: true, secure: false, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 }),
    );
  });

  it("debería usar cookies secure y sameSite none en producción", () => {
    jest.isolateModules(() => {
      process.env.NODE_ENV = "production";
      process.env.JWT_SECRET_KEY = "a".repeat(32);
      process.env.JWT_SECRET_KEY_REFRESH = "b".repeat(32);

      // IS_PRODUCTION se computa al cargar el módulo, necesitamos recargarlo
      const { generateTokens } = require("../utils/generateSecret");

      (require("jsonwebtoken").sign as jest.Mock).mockReturnValue("token");

      const mockRes = { cookie: jest.fn() };
      generateTokens("1", mockRes as any);

      const callArgs = (mockRes.cookie as jest.Mock).mock.calls[0][2];
      expect(callArgs.secure).toBe(true);
      expect(callArgs.sameSite).toBe("none");
    });
  });
});

describe("module-level validation", () => {
  it("debería lanzar error si JWT_SECRET_KEY no está definida", () => {
    jest.isolateModules(() => {
      delete process.env.JWT_SECRET_KEY;
      process.env.JWT_SECRET_KEY_REFRESH = "b".repeat(32);

      expect(() => {
        require("../utils/generateSecret");
      }).toThrow("JWT_SECRET_KEY must be at least 32 characters long");
    });
  });

  it("debería lanzar error si JWT_SECRET_KEY es menor a 32 caracteres", () => {
    jest.isolateModules(() => {
      process.env.JWT_SECRET_KEY = "short";
      process.env.JWT_SECRET_KEY_REFRESH = "b".repeat(32);

      expect(() => {
        require("../utils/generateSecret");
      }).toThrow("JWT_SECRET_KEY must be at least 32 characters long");
    });
  });

  it("debería lanzar error si JWT_SECRET_KEY_REFRESH no está definida", () => {
    jest.isolateModules(() => {
      process.env.JWT_SECRET_KEY = "a".repeat(32);
      delete process.env.JWT_SECRET_KEY_REFRESH;

      expect(() => {
        require("../utils/generateSecret");
      }).toThrow("JWT_SECRET_KEY_REFRESH must be at least 32 characters long");
    });
  });

  it("debería cargar sin error si ambas claves tienen 32+ caracteres", () => {
    jest.isolateModules(() => {
      process.env.JWT_SECRET_KEY = "a".repeat(32);
      process.env.JWT_SECRET_KEY_REFRESH = "b".repeat(32);

      expect(() => {
        require("../utils/generateSecret");
      }).not.toThrow();
    });
  });
});
