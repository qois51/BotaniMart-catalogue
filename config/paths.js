const path = require('path');
module.exports = {
  public: path.join(__dirname, '..', 'public'),
  views: path.join(__dirname, '..', 'public', 'views'),
  db: path.join(__dirname, '..', 'models', 'index.js'),
  server: path.join(__dirname, '..', 'server'),
  admin: path.join(__dirname, '..', 'public', 'views', 'admin'),
}
