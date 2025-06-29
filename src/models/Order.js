module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shippingMethod: {
      type: DataTypes.ENUM('inpost_courier', 'inpost_locker'),
      allowNull: false,
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    wantInvoice: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    invoiceType: {
      type: DataTypes.ENUM('private', 'company'),
      allowNull: true,
    },
    privateInvoiceAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyNip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyStreet: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyHouseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyPostalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    productPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    shippingPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'orders',
    timestamps: true,
  });

  Order.associate = function (models) {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    Order.belongsTo(models.Address, { foreignKey: 'shippingAddressId', as: 'shippingAddress' });
    Order.belongsTo(models.Address, { foreignKey: 'privateInvoiceAddressId', as: 'privateInvoiceAddress' });
    Order.hasOne(models.Payment, { foreignKey: 'orderId', as: 'payment' });
  };

  return Order;
};