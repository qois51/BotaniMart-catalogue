const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/admin');
  }

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.redirect('/admin');
    }

    req.user = decoded;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.redirect('/admin');
  }
};

module.exports = { 
  requireAuth, 
  requireAdmin,
};