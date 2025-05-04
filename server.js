const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./auth/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  console.log('Serving login.html');
  res.sendFile(path.join(__dirname, 'public', 'loginFrontend.html'));
});

// Static files middleware should come after the route
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes
app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});