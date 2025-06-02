module.exports = (sequelize, DataTypes) => {
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
    condition: {
      type: DataTypes.ENUM('new', 'used', 'refurbished', 'damaged'),
      allowNull: false,
      defaultValue: 'new'
    },
    deliveryMethod: {
      type: DataTypes.ENUM('pickup', 'delivery', 'both'),
      allowNull: false,
      defaultValue: 'both',
    },
    sharePhoneNumber: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    photo1: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    photo2: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    photo3: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    photo4: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    photo5: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isSold: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'products',
    timestamps: true,
  });

  Product.associate = function (models) {
    Product.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    Product.hasMany(models.ProductLike, {
      foreignKey: 'productId',
      as: 'likes'
    });
  };

  return Product;
};