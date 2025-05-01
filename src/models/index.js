const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../../config/db');

const db = {};

// 1. Najpierw podstawowe modele
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Category = require('./Category')(sequelize, Sequelize.DataTypes);

// 2. Potem modele które zależą od podstawowych
db.Product = require('./Product')(sequelize, Sequelize.DataTypes);
db.ProductLike = require('./ProductLike')(sequelize, Sequelize.DataTypes);
db.Session = require('./Session')(sequelize, Sequelize.DataTypes);
db.Address = require('./Address')(sequelize, Sequelize.DataTypes);

// Definicja relacji PO załadowaniu wszystkich modeli
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;