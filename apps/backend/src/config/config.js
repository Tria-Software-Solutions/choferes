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

const sslConfig = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

// Database configuration for different environments (development, test, production)
// Values are loaded from environment variables for security and flexibility
const config = {
  development: {
    ...db,
    dialect: "postgres",
    dialectOptions: sslConfig,
  },
  test: {
    ...db,
    dialect: "postgres",
    dialectOptions: sslConfig,
  },
  production: {
    ...db,
    dialect: "postgres",
    dialectOptions: sslConfig,
  },
};

// Export the configuration object for use by Sequelize and other modules
module.exports = config;
