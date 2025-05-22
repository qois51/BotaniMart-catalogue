const session = require('express-session');
const jwt = require('jsonwebtoken');

// Session configuration middleware
const configureSession = (app) => {
  app.use(session({
    secret: 'your_secret_key', // Use a strong, random string in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/admin');
  }
};

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = decoded.userId;
    next();
  });
};

module.exports = { 
  configureSession, 
  requireAuth, 
  requireAdmin,
  verifyToken
};