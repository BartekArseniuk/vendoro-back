module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '📦'
    },
    imageUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    }
  }, {
    tableName: 'categories',
    timestamps: true,
  });

  Category.associate = function (models) {
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products'
    });
  };

  return Category;
};
