"use strict";
const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
const dbConfig = require("./config")[env];
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
module.exports = sequelize;
