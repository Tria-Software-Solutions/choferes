// Load environment variables from .env file
require("dotenv").config();

const url = require("url");

// Support DATABASE_URL (Render/Heroku default) or individual PG env vars
function parseDbUrl() {
  if (process.env.DATABASE_URL) {
    const parsed = new url.URL(process.env.DATABASE_URL);
    return {
      username: parsed.username,
      password: parsed.password,
      host: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname.replace(/^\//, ""),
    };
  }
  return {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
  };
}

const db = parseDbUrl();

if (!db.host || !db.database) {
  throw new Error(
    "Database not configured. Set DATABASE_URL (Render PostgreSQL) or PGUSER, PGPASSWORD, PGDATABASE, PGHOST environment variables.",
  );
}

// Managed providers (Render/Heroku/Neon) commonly present certificates that are
// not anchored in the system trust store, so verification used to be disabled
// outright. It can now be enabled without code changes:
//   PGSSL_CA=<provider CA, PEM or base64>   → verify against that CA (strongest)
//   PGSSL_REJECT_UNAUTHORIZED=true          → verify against the system store
const caEnv = process.env.PGSSL_CA;
let ca;
if (caEnv && caEnv.includes("BEGIN CERTIFICATE")) {
  ca = caEnv.replace(/\\n/g, "\n");
} else if (caEnv) {
  ca = Buffer.from(caEnv, "base64").toString("utf8");
}

const sslConfig = {
  ssl: {
    require: true,
    rejectUnauthorized:
      caEnv !== undefined ? true : process.env.PGSSL_REJECT_UNAUTHORIZED === "true",
    ...(ca ? { ca } : {}),
  },
};

// Database configuration for different environments (development, test, production)
// Values are loaded from environment variables for security and flexibility
// Only use SSL for non-local connections (production/staging on Render/Heroku)
const isLocalHost =
  !db.host || db.host === "localhost" || db.host === "127.0.0.1" || db.host === "0.0.0.0";
const useSSL = !isLocalHost && (process.env.NODE_ENV === "production" || process.env.DATABASE_URL);

const makeDialectOptions = () => {
  if (useSSL) return sslConfig;
  // Explicitly disable SSL for local connections to avoid pg default behavior
  return { ssl: false };
};

if (useSSL && !ca && process.env.PGSSL_REJECT_UNAUTHORIZED !== "true") {
  // eslint-disable-next-line no-console
  console.warn(
    "[db] TLS certificate verification is disabled (rejectUnauthorized=false). " +
      "Set PGSSL_CA (provider CA) or PGSSL_REJECT_UNAUTHORIZED=true to enable it.",
  );
}

const config = {
  development: {
    ...db,
    dialect: "postgres",
    dialectOptions: makeDialectOptions(),
  },
  test: {
    ...db,
    dialect: "postgres",
    dialectOptions: makeDialectOptions(),
  },
  production: {
    ...db,
    dialect: "postgres",
    dialectOptions: makeDialectOptions(),
  },
};

// Export the configuration object for use by Sequelize and other modules
module.exports = config;
