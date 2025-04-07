const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const User = require('./User');
const Category = require('./Category');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = Product;