const path = require('path');
module.exports = {
  public: path.join(__dirname, '..', 'public'),
  db: path.join(__dirname, '..', 'models', 'index.js'),
  server: path.join(__dirname, '..', 'server'),
  admin: path.join(__dirname, '..', 'server', 'admin'),
}
