module.exports = (sequelize, DataTypes) => {
    const ProductLike = sequelize.define('ProductLike', {
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    }, {
        tableName: 'product_likes',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['productId', 'userId'],
                name: 'product_likes_unique_constraint'
            }
        ]
    });

    ProductLike.associate = function (models) {
        ProductLike.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        ProductLike.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'product'
        });
    };

    return ProductLike;
};