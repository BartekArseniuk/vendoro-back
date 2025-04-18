module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false
        },
        houseNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\d{2}-\d{3}$/ // Format np. 00-000
            }
        },
        type: {
            type: DataTypes.ENUM('shipping', 'billing', 'both'),
            allowNull: false,
            defaultValue: 'both'
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'addresses',
        timestamps: true
    });

    Address.associate = function (models) {
        Address.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
            onDelete: 'CASCADE'
        });
    };

    return Address;
};