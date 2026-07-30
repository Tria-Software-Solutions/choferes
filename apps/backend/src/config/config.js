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

const sslConfig = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

// Database configuration for different environments (development, test, production)
// Values are loaded from environment variables for security and flexibility
// eslint-disable-next-line no-console
console.log(`[DB] Config: host=${db.host}, database=${db.database}, user=${db.username}`);

// Only use SSL for non-local connections (production/staging on Render/Heroku)
const isLocalHost =
  !db.host || db.host === "localhost" || db.host === "127.0.0.1" || db.host === "0.0.0.0";
const useSSL = !isLocalHost && (process.env.NODE_ENV === "production" || process.env.DATABASE_URL);

// eslint-disable-next-line no-console
console.log(
  `[DB] SSL: ${useSSL ? "enabled" : "disabled"} (host=${db.host}, NODE_ENV=${process.env.NODE_ENV || "development"})`,
);

const makeDialectOptions = () => {
  if (useSSL) return sslConfig;
  // Explicitly disable SSL for local connections to avoid pg default behavior
  return { ssl: false };
};

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
