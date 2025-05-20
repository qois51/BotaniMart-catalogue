'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    namaProduk: {
      type: DataTypes.STRING,
      allowNull: false
    },
    namaLatin: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    stockProduk: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hargaProduk: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specification: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    caraPerawatan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    kategoriMain: {
      type: DataTypes.STRING,
      allowNull: false
    },
    kategoriSub: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gambarUtama: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gambarKedua: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gambarKetiga: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gambarKeempat: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};