const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
// const authMiddleware = require('./auth.middleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/reset-check-email', authController.checkEmailReset);
router.post('/reset-password', authController.setNewPassword);
router.post('/register', authController.register);

module.exports = router;