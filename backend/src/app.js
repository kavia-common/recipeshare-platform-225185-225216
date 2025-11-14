require('dotenv').config();

const express = require('express');

console.log('[startup] Loading app.js...');
const app = express();

// Core middlewares
app.use(express.json());

// PUBLIC_INTERFACE
app.get('/', (req, res) => {
  /**
   * Basic root ping route for startup verification
   * Keep this simple and always available.
   */
  res.status(200).send('OK: FlavorFolio backend root');
});

// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  /**
   * Health endpoint that always returns 200
   */
  res.status(200).send('ok');
});

// Mount consolidated routes (includes health JSON and recipes)
const routes = require('./routes');
app.use('/', routes);

// Keep a simple centralized error handler
app.use((err, req, res, next) => {
  console.error('[error] Caught in app:', err?.stack || err);
  res.status(500).send('error');
});

module.exports = app;
