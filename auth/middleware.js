const jwt = require('jsonwebtoken');

// Middleware untuk otentikasi dengan JWT
exports.authToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
  }

  jwt.verify(token, 'secretkey', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
};