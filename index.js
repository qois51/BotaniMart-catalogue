const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const PATHS = require('./config/paths')
const authRoutes = require(path.join(PATHS.server, 'auth', 'auth.routes.js'))
const { queryProducts } = require(path.join(PATHS.server, 'logic', 'queryProduct.js'));

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(PATHS.public);
app.use(connectLivereload());

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(PATHS.public)));

app.get('/', (req, res) => {
  res.sendFile(path.join(PATHS.public, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
  console.log('Serving login.html');
  res.sendFile(path.join(PATHS.public, 'views', 'login-admin.html'));
});

// Auth routes
app.use('/auth', authRoutes);

// Products route
app.get('/products', async (req, res) => {
  try {
    const products = await queryProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Notify browser on changes
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});