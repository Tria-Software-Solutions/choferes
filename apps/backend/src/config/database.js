// Sequelize database connection setup
const { Sequelize } = require("sequelize");
const config = require("./config");

// Determine the current environment (default to development)
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Create a new Sequelize instance with environment-specific configuration
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host, // Database host
  port: dbConfig.port || 5432, // Database port (default PostgreSQL)
  dialect: dbConfig.dialect, // Database dialect (e.g., postgres)
  logging: false, // Disable SQL query logging
  operatorsAliases: {
    $or: Sequelize.Op.or,
    $iLike: Sequelize.Op.iLike,
    $between: Sequelize.Op.between,
    $in: Sequelize.Op.in,
  },
  pool: {
    max: 20, // Maximum number of connections
    min: 0, // Avoid keeping idle connections alive after long inactivity
    acquire: 60000, // Maximum time (ms) to try getting a connection
    idle: 10000, // Maximum time (ms) a connection can be idle
    evict: 1000, // Reap stale idle connections quickly
  },
  retry: {
    max: 2,
    match: [
      /SequelizeConnectionError/i,
      /SequelizeConnectionAcquireTimeoutError/i,
      /SequelizeConnectionRefusedError/i,
      /SequelizeHostNotFoundError/i,
      /SequelizeHostNotReachableError/i,
      /SequelizeInvalidConnectionError/i,
      /Connection terminated unexpectedly/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
    ],
  },
  // Apply dialectOptions from config (includes SSL settings) with session timeouts
  dialectOptions: {
    ...(dbConfig.dialectOptions || {}),
    statement_timeout: 30000,
    query_timeout: 30000,
    idle_in_transaction_session_timeout: 30000,
  },
  benchmark: false, // Disable query benchmarking
  define: {
    timestamps: true, // Add createdAt/updatedAt fields by default
    underscored: false, // Use camelCase for columns
    freezeTableName: true, // Prevent pluralizing table names
  },
});

// Export the Sequelize instance for use throughout the app
module.exports = sequelize;
