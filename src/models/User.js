const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const fs = require('fs');
const path = require('path');

const defaultAvatar = fs.readFileSync(path.join(__dirname, '../../config/defaultAvatar.txt'), 'utf8');

const User = sequelize.define('User', {
  avatar: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    defaultValue: defaultAvatar
  },  
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  passwordChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

User.associate = function (models) {
  User.hasMany(models.Session, {
    foreignKey: 'userId',
    as: 'sessions'
  });
};

module.exports = User;