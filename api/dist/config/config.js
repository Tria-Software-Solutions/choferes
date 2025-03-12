require("dotenv").config();

module.exports = {
  development: {
    username: "postgres",
    password: "root",
    database: "choferes",
    host: "127.0.0.1",
    port: 5432,
    dialect: "postgres",
    dialectOptions: {},
  },
  production: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  authConfig: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,  
    JWT_SECRET_KEY_REFRESH: process.env.JWT_SECRET_KEY_REFRESH, 
    NODE_ENV: process.env.NODE_ENV || "development", 
  },
};
