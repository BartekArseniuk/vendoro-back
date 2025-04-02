const Sequelize = require('sequelize');
const config = require('./config.json');
const environment = 'development';

const sequelize = new Sequelize(
  config[environment].database,
  config[environment].username,
  config[environment].password,
  {
    host: config[environment].host,
    dialect: config[environment].dialect,
    port: config[environment].port,
  }
);

module.exports = sequelize;