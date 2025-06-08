'use strict';

const bcrypt = require('bcrypt');
const config = require('../config/config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
  up: async (queryInterface) => {
    const adminPassword = config.development.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('Brak hasła admina w config.json! Dodaj klucz ADMIN_PASSWORD');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const defaultAvatarPath = path.join(__dirname, '../config/defaultAvatar.txt');
    const defaultAvatar = fs.readFileSync(defaultAvatarPath, 'utf8');

    const now = new Date();

    return queryInterface.bulkInsert('users', [{
      firstName: 'Admin',
      lastName: 'Admin',
      email: 'admin@vendoro.pl',
      password: hashedPassword,
      avatar: defaultAvatar,
      role: 'admin',
      isVerified: true,
      firstLogin: false,
      createdAt: now,
      updatedAt: now
    }]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('users', {
      email: 'admin@vendoro.pl'
    });
  }
};