// Mock sequelize/database
jest.mock("../config/database", () => ({
  __esModule: true,
  default: {
    authenticate: jest.fn(),
  },
}));

type HealthStatus = {
  status: string;
  timestamp: string;
  database: { status: string; message?: string };
  environment: {
    nodeEnv: string;
    hasJwtSecret: boolean;
    hasJwtRefreshSecret: boolean;
    hasDatabaseConfig: boolean;
  };
};

// Helper to set health-related env vars
const setHealthEnv = (overrides?: Record<string, string | undefined>) => {
  const defaults: Record<string, string | undefined> = {
    NODE_ENV: "test",
    JWT_SECRET_KEY: "a".repeat(32),
    JWT_SECRET_KEY_REFRESH: "b".repeat(32),
    PGUSER: "test_user",
    PGPASSWORD: "test_pass",
    PGDATABASE: "test_db",
    PGHOST: "localhost",
    ...overrides,
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
};

const clearHealthEnv = () => {
  [
    "NODE_ENV",
    "JWT_SECRET_KEY",
    "JWT_SECRET_KEY_REFRESH",
    "PGUSER",
    "PGPASSWORD",
    "PGDATABASE",
    "PGHOST",
  ].forEach((key) => delete process.env[key]);
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  clearHealthEnv();
});

describe("checkHealth", () => {
  it("debería devolver status OK cuando la base de datos responde y env vars están completas", async () => {
    setHealthEnv();
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockResolvedValue(undefined);

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.status).toBe("OK");
    expect(result.database.status).toBe("OK");
    expect(result.database.message).toBe("Database connection successful");
    expect(result.environment.nodeEnv).toBe("test");
    expect(result.environment.hasJwtSecret).toBe(true);
    expect(result.environment.hasJwtRefreshSecret).toBe(true);
    expect(result.environment.hasDatabaseConfig).toBe(true);
  });

  it("debería devolver status ERROR cuando la base de datos falla", async () => {
    setHealthEnv();
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockRejectedValue(new Error("Connection refused"));

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.status).toBe("ERROR");
    expect(result.database.status).toBe("ERROR");
    expect(result.database.message).toBe("Connection refused");
  });

  it("debería devolver status ERROR si falta JWT_SECRET_KEY", async () => {
    setHealthEnv({ JWT_SECRET_KEY: undefined });
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockResolvedValue(undefined);

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.status).toBe("ERROR");
    expect(result.environment.hasJwtSecret).toBe(false);
  });

  it("debería devolver status ERROR si falta JWT_SECRET_KEY_REFRESH", async () => {
    setHealthEnv({ JWT_SECRET_KEY_REFRESH: undefined });
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockResolvedValue(undefined);

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.status).toBe("ERROR");
    expect(result.environment.hasJwtRefreshSecret).toBe(false);
  });

  it("debería devolver status ERROR si falta configuración de base de datos", async () => {
    setHealthEnv({ PGUSER: undefined });
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockResolvedValue(undefined);

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.status).toBe("ERROR");
    expect(result.environment.hasDatabaseConfig).toBe(false);
  });

  it("debería usar default 'development' si NODE_ENV no está definido", async () => {
    setHealthEnv({ NODE_ENV: undefined });
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockResolvedValue(undefined);

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.environment.nodeEnv).toBe("development");
  });

  it("debería incluir timestamp en el resultado", async () => {
    setHealthEnv();
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockResolvedValue(undefined);

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it("debería verificar que JWT_SECRET_KEY debe tener >= 32 caracteres", async () => {
    setHealthEnv({ JWT_SECRET_KEY: "short_key" });
    const sequelize = require("../config/database").default;
    sequelize.authenticate.mockResolvedValue(undefined);

    const checkHealth = require("../services/healthService").default;
    const result: HealthStatus = await checkHealth();

    expect(result.environment.hasJwtSecret).toBe(false);
  });
});
