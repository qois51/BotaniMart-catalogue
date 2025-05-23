'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Products', 'stockProduk', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Products', 'stockProduk', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  }
};