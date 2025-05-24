const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller.js');
const auth = require('../auth/auth.middleware.js');

// Public
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/:id/views', productController.addProductView);

// Admin
router.post('/upload-temp', auth.requireAuth, auth.requireAdmin, productController.uploadTempImage);
router.post('/', auth.requireAuth, auth.requireAdmin, productController.createProduct);
router.put('/:id', auth.requireAuth, auth.requireAdmin, productController.updateProduct);
router.delete('/:id', auth.requireAuth, auth.requireAdmin, productController.deleteProduct);

module.exports = router;