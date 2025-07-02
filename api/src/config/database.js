const { Sequelize } = require("sequelize");
const config = require("./config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false,
  dialectOptions: dbConfig.dialectOptions || {},
  pool: {
    max: 20,
    min: 5,
    acquire: 60000,
    idle: 10000,
  },
  ...(dbConfig.dialect === "postgres" && {
    dialectOptions: {
      ...dbConfig.dialectOptions,
      statement_timeout: 30000,
      query_timeout: 30000,
      idle_in_transaction_session_timeout: 30000,
    },
  }),
  benchmark: false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

module.exports = sequelize;
