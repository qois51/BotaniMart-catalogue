'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const { Product } = require('../models');

    await Product.bulkCreate([
      {
        namaProduk: 'Benih Padi Inpari 13 U',
        namaLatin: 'Oryza sativa',
        stockProduk: 200,
        hargaProduk: 30000,
        deskripsi: 'Benih padi unggul Inpari 13 U',
        spesification: 'Kemasan 1 kg, Kemurnian 98%',
        caraPerawatan: 'Tanam pada lahan yang teduh dan lembab',
        kategoriMain: 'Bibit',
        kategoriSub: 'Bibit Padi',
        gambarUtama: 'benih-padi.jpg',
        gambarKedua: 'benih-padi-2.jpg',
        gambarKetiga: null,
        gambarKeempat: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        namaProduk: 'Pupuk Organik Cair',
        namaLatin: null,
        stockProduk: 150,
        hargaProduk: 50000,
        deskripsi: 'Pupuk organik cair untuk tanaman',
        spesification: 'Kemasan 1 liter, pH 6.5',
        caraPerawatan: 'Semprotkan pada daun setiap 2 minggu sekali',
        kategoriMain: 'Pupuk',
        kategoriSub: 'Pupuk Organik',
        gambarUtama: 'pupuk-organik.jpg',
        gambarKedua: 'pupuk-organik-2.jpg',
        gambarKetiga: null,
        gambarKeempat: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        namaProduk: 'Benih Jagung Hibrida',
        namaLatin: 'Zea mays',
        stockProduk: 150,
        hargaProduk: 45000,
        deskripsi: 'Benih jagung hibrida berkualitas',
        spesification: 'Kemasan 500 gram, Kemurnian 97%',
        caraPerawatan: 'Tanam pada lahan yang subur dan cukup sinar matahari',
        kategoriMain: 'Bibit',
        kategoriSub: 'Bibit Jagung',
        gambarUtama: 'benih-jagung.jpg',
        gambarKedua: null,
        gambarKetiga: null,
        gambarKeempat: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        namaProduk: 'Pupuk NPK Granul',
        namaLatin: null,
        stockProduk: 100,
        hargaProduk: 60000,
        deskripsi: 'Pupuk NPK granul untuk tanaman',
        spesification: 'Kemasan 25 kg, NPK 16-16-16',
        caraPerawatan: 'Taburkan pada tanah sebelum tanam',
        kategoriMain: 'Pupuk',
        kategoriSub: 'Pupuk Kimia',
        gambarUtama: 'pupuk-npk.jpg',
        gambarKedua: null,
        gambarKetiga: null,
        gambarKeempat: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        namaProduk: 'Alat Penanam Padi',
        namaLatin: null,
        stockProduk: 10,
        hargaProduk: 1500000,
        deskripsi: 'Alat penanam padi modern',
        spesification: 'Bahan baja kokoh, Kapasitas 1 hektar per hari',
        caraPerawatan: 'Lumasi secara berkala dan simpan di tempat kering',
        kategoriMain: 'Pertanian',
        kategoriSub: 'Alat Pertanian',
        gambarUtama: 'alat-penanam-padi.jpg',
        gambarKedua: null,
        gambarKetiga: null,
        gambarKeempat: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    const { Product } = require('../models');

    await Product.destroy({
      where: {},
      truncate: true
    });
  }
};
