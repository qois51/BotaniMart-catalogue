const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller.js');

// Get all products
router.get('/', productController.getAllProducts);

// Get product by ID
router.get('/:id', productController.getProductById);

// Create new product (with image upload)
router.post('/', productController.createProduct);

// Upload temporary image
router.post('/upload-temp', productController.uploadTempImage);

module.exports = router;