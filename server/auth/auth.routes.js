const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('./auth.middleware');

// Auth routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/reset-check-email', authController.checkEmailReset);
router.post('/reset-password', authController.setNewPassword);
router.post('/register', authController.register);
router.get('/check', authMiddleware.requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

module.exports = router;