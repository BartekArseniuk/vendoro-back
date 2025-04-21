'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      deliveryMethod: {
        type: Sequelize.ENUM('pickup', 'delivery', 'both'),
        allowNull: false,
        defaultValue: 'both'
      },
      sharePhoneNumber: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      photo1: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      photo2: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      photo3: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      photo4: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      photo5: {
        type: Sequelize.TEXT('long'),
        allowNull: true
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
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('products');
  },
};