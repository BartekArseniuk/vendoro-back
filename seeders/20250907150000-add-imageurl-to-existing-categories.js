'use strict';

const path = require('path');
const { getCategoryImageUrl } = require(path.resolve(__dirname, '../src/services/unsplashService'));

module.exports = {
  async up(queryInterface, Sequelize) {
    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM categories',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let i = 0;

    for (const cat of categories) {
      const url = await getCategoryImageUrl(cat.name);
      if (url) {
        await queryInterface.bulkUpdate(
          'categories',
          { imageUrl: url, updatedAt: new Date() },
          { id: cat.id }
        );
        console.log(`✔ Ustawiono obraz dla: ${cat.name}`);
      } else {
        console.warn(`— Brak dopasowania: ${cat.name}`);
      }

      if (++i % 25 === 0) await sleep(500);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      'categories',
      { imageUrl: null, updatedAt: new Date() },
      {}
    );
  }
};
