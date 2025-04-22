const express = require('express');
const path = require('path');
const fs = require('fs');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();
const PORT = 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Start livereload server
if (isDev) {
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, 'public'));

  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/');
    }, 100);
  });

  app.use(connectLivereload());
}

// Middleware to inject livereload script
app.get('/', (req, res, next) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');

  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) return next(err);

    // Inject livereload script before </body>
    const liveReloadScript = `<script src="http://localhost:35729/livereload.js?snipver=1"></script>`;
    const result = data.replace('</body>', `${liveReloadScript}</body>`);

    res.send(result);
  });
});

// Serve static files
app.use(express.static('public'));

// API route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express with LiveReload!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
