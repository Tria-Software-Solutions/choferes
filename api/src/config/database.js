// Sequelize database connection setup
const { Sequelize } = require("sequelize");
const config = require("./config");

// Determine the current environment (default to development)
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Create a new Sequelize instance with environment-specific configuration
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host, // Database host
  dialect: dbConfig.dialect, // Database dialect (e.g., postgres)
  logging: false, // Disable SQL query logging
  dialectOptions: dbConfig.dialectOptions || {}, // Additional dialect options (e.g., SSL)
  pool: {
    max: 20, // Maximum number of connections
    min: 5,  // Minimum number of connections
    acquire: 60000, // Maximum time (ms) to try getting a connection
    idle: 10000,    // Maximum time (ms) a connection can be idle
  },
  // Postgres-specific session timeouts
  ...(dbConfig.dialect === "postgres" && {
    dialectOptions: {
      ...dbConfig.dialectOptions,
      statement_timeout: 30000,
      query_timeout: 30000,
      idle_in_transaction_session_timeout: 30000,
    },
  }),
  benchmark: false, // Disable query benchmarking
  define: {
    timestamps: true, // Add createdAt/updatedAt fields by default
    underscored: false, // Use camelCase for columns
    freezeTableName: true, // Prevent pluralizing table names
  },
});

// Export the Sequelize instance for use throughout the app
module.exports = sequelize;
