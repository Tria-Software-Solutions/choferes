"use strict";
require('dotenv').config();
module.exports = {
    development: {
        username: "postgres",
        password: "root",
        database: "choferes",
        host: "127.0.0.1",
        dialect: "postgres"
    },
    production: {
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        host: process.env.PGHOST,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    },
};
