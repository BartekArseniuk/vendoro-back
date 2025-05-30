'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      shippingMethod: {
        type: Sequelize.ENUM('inpost_courier', 'inpost_locker'),
        allowNull: false,
      },
      shippingAddressId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'addresses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      wantInvoice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      invoiceType: {
        type: Sequelize.ENUM('private', 'company'),
        allowNull: true,
      },
      privateInvoiceAddressId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'addresses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyNip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyStreet: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyHouseNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyPostalCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyCity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      productPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      shippingPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      totalPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  },
};