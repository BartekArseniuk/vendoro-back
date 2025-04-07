'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Elektronika',
        description: 'Wszystko, co związane z elektroniką',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Meble',
        description: 'Meble do domu i ogrodu',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Odzież',
        description: 'Ubrania, akcesoria, obuwie',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Motoryzacja',
        description: 'Części, akcesoria, pojazdy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sport',
        description: 'Sprzęt i odzież sportowa',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};