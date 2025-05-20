'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Products', 'spesification', 'specification');
    
    await queryInterface.addColumn('Products', 'gambarKetiga', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'gambarKetiga');
    
    await queryInterface.renameColumn('Products', 'specification', 'spesification');
  }
};