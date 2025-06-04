module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
        ratedUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        raterUserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'ratings',
        timestamps: true,
    });

    Rating.associate = function (models) {
        Rating.belongsTo(models.User, {
            as: 'ratedUser',
            foreignKey: 'ratedUserId',
        });
        Rating.belongsTo(models.User, {
            as: 'raterUser',
            foreignKey: 'raterUserId',
        });
    };

    return Rating;
};