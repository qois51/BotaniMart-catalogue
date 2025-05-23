const path = require('path');
const PATHS = require('./config/paths');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { requireAuth, requireAdmin } = require(path.join(PATHS.server, 'auth', 'auth.middleware.js'));
const authRoutes = require(path.join(PATHS.server, 'auth', 'auth.routes.js'));
const productRoutes = require(path.join(PATHS.server, 'routes', 'product.routes.js'));
const { setupDirectories } = require(path.join(PATHS.server, 'util', 'setup.js'));
setupDirectories();
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const { queryProducts } = require(path.join(PATHS.server, 'logic', 'queryProduct.js'));
const db = require(PATHS.db);
const app = express();
const PORT = process.env.PORT || 3000;

// Setup Livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(PATHS.public);
app.use(connectLivereload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/products', productRoutes);
app.use(express.static(path.join(PATHS.public)));

app.get('/', (req, res) => {
  res.sendFile(path.join(PATHS.public, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
  console.log('Serving login.html');
  res.sendFile(path.join(PATHS.public, 'views', 'login-admin.html'));
});

app.get('/newadmin', (req, res) => {
  console.log('Serving login.html');
  res.sendFile(path.join(PATHS.public, 'views', 'new-admin.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(PATHS.admin, 'dashboard.html'));
});

app.get('/add-product', requireAuth, requireAdmin, (req, res) => {
  res.sendFile(path.join(PATHS.admin, 'addProduct.html'));
});

app.get('/edit-product', requireAuth, requireAdmin, (req, res) => {
  res.sendFile(path.join(PATHS.admin, 'editProduct.html'));
});

app.use('/auth', authRoutes);

// Notify browser on changes
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});