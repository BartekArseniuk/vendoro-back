const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Config = sequelize.define('Config', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    is_comain_register: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    plan_Reading_prompt: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'configs',
    timestamps: true
});

module.exports = Config;