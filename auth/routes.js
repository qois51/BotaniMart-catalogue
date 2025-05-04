const express = require('express');
const router = express.Router();
const authController = require('./controller');

router.post('/login', authController.login);
router.post('/reset-check-email', authController.checkEmailReset);
router.post('/reset-password', authController.setNewPassword);

module.exports = router;