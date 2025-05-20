'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { Admin } = require('../models');

    await Admin.bulkCreate([
      {
        username: 'JohnDoe',
        name: 'John Doe',
        email: 'johnexample@gmail.com',
        password: "password123"
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    const { Admin } = require('../models');

    await Admin.destroy({
      where: {},
      truncate: true
    });
  }
};
