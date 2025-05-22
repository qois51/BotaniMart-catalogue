const path = require('path');
const PATHS = require('./config/paths')

const express = require('express');
const bodyParser = require('body-parser');

const { configureSession, requireAuth, requireAdmin } = require(path.join(PATHS.server, 'auth', 'auth.middleware.js'));

const authRoutes = require(path.join(PATHS.server, 'auth', 'auth.routes.js'))

const productRoutes = require(path.join(PATHS.server, 'routes', 'product.routes.js'));

const { setupDirectories } = require(path.join(PATHS.server, 'util', 'setup.js'));
setupDirectories();

const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const { queryProducts } = require(path.join(PATHS.server, 'logic', 'queryProduct.js'));

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(PATHS.public);
app.use(connectLivereload());

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

configureSession(app);

// Add this along with your other routes
app.use('/api/products', productRoutes);

// Serve static files
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

// Auth routes
app.use('/auth', authRoutes);

// Route to get current user information
app.get('/auth/current-user', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ 
      loggedIn: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      loggedIn: false 
    });
  }
});

// Products route
app.get('/products', async (req, res) => {
  try {
    const id = req.query.id ? parseInt(req.query.id) : null;

    if (id && isNaN(id)) {
      return res.status(400).json({ error: 'Parameter ID tidak valid.' });
    }

    const product = await queryProducts(id);

    if (id && !product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route for getting a product by ID (using path parameter)
app.get('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Parameter ID tidak valid.' });
    }
    
    const product = await queryProducts(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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