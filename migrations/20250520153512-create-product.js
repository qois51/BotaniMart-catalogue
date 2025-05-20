'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      namaProduk: {
        type: Sequelize.STRING,
        allowNull: false
      },
      namaLatin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stockProduk: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      hargaProduk: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      deskripsi: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      spesification: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      caraPerawatan: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      kategoriMain: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kategoriSub: {
        type: Sequelize.STRING, 
        allowNull: false
      },
      gambarUtama: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gambarKedua: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gambarKeempat: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};