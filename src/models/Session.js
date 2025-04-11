const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Session = sequelize.define('Session', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING(512),
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'sessions',
    timestamps: true,
});

Session.associate = function (models) {
    Session.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
    });
};

module.exports = Session;