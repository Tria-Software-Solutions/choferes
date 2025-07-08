// Load environment variables from .env file
require("dotenv").config();

// Database configuration for different environments (development, test, production)
// Values are loaded from environment variables for security and flexibility
const config = {
  development: {
    username: process.env.PGUSER, // Database username
    password: process.env.PGPASSWORD, // Database password
    database: process.env.PGDATABASE, // Database name
    host: process.env.PGHOST, // Database host
    dialect: "postgres", // Database dialect
    // No SSL for development
  },
  test: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    dialect: "postgres",
    // No SSL for test
  },
  production: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: false,
    },
  },
};

// Export the configuration object for use by Sequelize and other modules
module.exports = config;
