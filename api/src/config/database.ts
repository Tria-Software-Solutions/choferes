require('dotenv').config(); 

import { Sequelize } from 'sequelize';

const config = require('./config.json'); 

const env = process.env.NODE_ENV || 'development'; 
const dbConfig = config[env]; 

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;