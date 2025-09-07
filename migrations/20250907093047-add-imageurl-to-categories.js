'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'imageUrl', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });

    await queryInterface.addConstraint('categories', {
      fields: ['name'],
      type: 'unique',
      name: 'unique_category_name'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('categories', 'unique_category_name').catch(() => {});
    await queryInterface.removeColumn('categories', 'imageUrl');
  }
};
