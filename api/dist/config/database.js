"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const sequelize_1 = require("sequelize");
const config = require('./config.json');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'postgres',
    logging: false,
});
exports.default = sequelize;
