const path = require('path');
const PATHS = require('./config/paths');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { requireAuth, requireAdmin } = require(path.join(PATHS.server, 'auth', 'auth.middleware.js'));
const authRoutes = require(path.join(PATHS.server, 'auth', 'auth.routes.js'));
const productRoutes = require(path.join(PATHS.server, 'routes', 'product.routes.js'));
const { setupDirectories, cleanupTempFiles } = require(path.join(PATHS.server, 'util', 'setup.js'));
require('dotenv').config();
setupDirectories();
cleanupTempFiles(0);

const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Setup Livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(PATHS.public);
app.use(connectLivereload());

app.use('/assets', express.static(path.join(PATHS.public, 'assets')));
app.use('/uploads', express.static(path.join(PATHS.public, 'uploads')));

app.get('/', (req, res) => {
  res.redirect('/about-us');
});

// Rute Publik
app.get('/:page', (req, res, next) => {
  let page = req.params.page;
  if (page.endsWith('.html')) {
    const cleanPage = page.slice(0, -5);
    return res.redirect(301, '/' + cleanPage);
  }
  const filePath = path.join(PATHS.views, `${page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      next();
    }
  });
});

app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);

// Rute Admin
app.get('/admin/:page', requireAuth, requireAdmin, (req, res, next) => {
  let page = req.params.page;
  if (page.endsWith('.html')) {
    const cleanPage = page.slice(0, -5);
    return res.redirect(301, `/admin/${cleanPage}`);
  }
  const filePath = path.join(PATHS.admin, `${page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) next();
  });
});

app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Livereload notification
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});