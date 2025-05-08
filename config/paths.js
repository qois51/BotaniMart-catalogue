const path = require('path');
module.exports = {
  public: path.join(__dirname, '..', 'public'),
  db: path.join(__dirname, '..', 'db', 'db.js'),
  server: path.join(__dirname, '..', 'server')
}
