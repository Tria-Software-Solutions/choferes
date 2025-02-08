const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const dbConfig = require("./config")[env];

console.log(dbConfig);

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false,
  }
);

module.exports = sequelize;