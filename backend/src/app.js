require('dotenv').config();

const express = require('express');
const healthController = require('./controllers/health');

console.log('[startup] Loading app.js...');
const app = express();

// Core middlewares
app.use(express.json());

/**
 * PUBLIC_INTERFACE
 * GET /
 * Fast root ping returning JSON health for startup verification.
 */
app.get('/', healthController.check.bind(healthController));

/**
 * PUBLIC_INTERFACE
 * GET /health
 * Fast JSON health endpoint for platform checks.
 */
app.get('/health', healthController.check.bind(healthController));

/**
 * PUBLIC_INTERFACE
 * GET /api/health
 * Ensure standardized JSON health is also available at /api/health.
 */
app.get('/api/health', healthController.check.bind(healthController));

// Mount consolidated routes (includes JSON health and recipes)
const routes = require('./routes');
app.use('/', routes);

// Keep a simple centralized error handler
app.use((err, req, res, next) => {
  console.error('[error] Caught in app:', err?.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
