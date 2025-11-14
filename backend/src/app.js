require('dotenv').config();

const express = require('express');
const healthController = require('./controllers/health');

console.log('[startup] Loading app.js...');
const app = express();

/**
 * PUBLIC_INTERFACE
 * Register synchronous, dependency-free health routes FIRST (no middleware).
 * These routes must not rely on async services or any external dependency to respond.
 * Exposes: '/', '/health', '/api/health', '/readyz', '/livez'
 */
// PUBLIC_INTERFACE
app.get('/', (req, res) => {
  // Synchronous, immediate OK response
  return res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// PUBLIC_INTERFACE
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// PUBLIC_INTERFACE
app.get('/readyz', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// PUBLIC_INTERFACE
app.get('/livez', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// Core middlewares (registered AFTER health routes)
app.use(express.json());

// Mount consolidated routes (includes other API endpoints)
const routes = require('./routes');
app.use('/', routes);

// Keep a simple centralized error handler
app.use((err, req, res, next) => {
  console.error('[error] Caught in app:', err?.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
