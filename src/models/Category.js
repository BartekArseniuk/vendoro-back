const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '📦'
  }
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;