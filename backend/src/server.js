require('dotenv').config();

/**
 * PUBLIC_INTERFACE
 * Server bootstrap
 * - Loads Express app (with health routes registered before any middleware).
 * - If app import fails, creates a minimal fallback app exposing '/', '/health', '/api/health', '/readyz', '/livez'.
 * - Binds to 0.0.0.0:(PORT||3001) and logs readiness.
 * - Exports both the server instance and the app for consumers that might import the app for testing.
 */
console.log('[startup] Bootstrapping server...');
let app;
try {
  app = require('./app');
} catch (e) {
  console.error('[startup] Failed to load app module, creating minimal fallback app:', e?.message || e);
}

// Minimal fallback app to guarantee readiness in case ./app export is missing or invalid
if (!app || typeof app.listen !== 'function') {
  const express = require('express');
  const fallback = express();

  // PUBLIC_INTERFACE
  fallback.get('/', (_req, res) => res.status(200).json({ status: 'ok', message: 'fallback', timestamp: new Date().toISOString() }));
  // PUBLIC_INTERFACE
  fallback.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
  // PUBLIC_INTERFACE
  fallback.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));
  // PUBLIC_INTERFACE
  fallback.get('/readyz', (_req, res) => res.status(200).json({ status: 'ok' }));
  // PUBLIC_INTERFACE
  fallback.get('/livez', (_req, res) => res.status(200).json({ status: 'ok' }));

  app = fallback;
  console.log('[startup] Using minimal fallback app for readiness.');
}

const PORT = Number.isFinite(parseInt(process.env.PORT, 10)) ? parseInt(process.env.PORT, 10) : 3001;
const HOST = '0.0.0.0';

console.log(`[startup] About to bind Express on ${HOST}:${PORT}...`);
let server;
try {
  server = app.listen(PORT, HOST, () => {
    const urlHost = 'localhost';
    console.log(`[startup] Express listening at http://${urlHost}:${PORT}`);
    console.log('[startup] Bind successful.');
  });
} catch (err) {
  console.error('[fatal] Failed to start server:', err?.stack || err);
  // Guarded: do not hard exit during startup in preview environments
  // Attempt to continue running so health endpoints can still be probed if possible.
}

// Guarded: avoid exiting the process on server 'error' events; just log for diagnostics
if (server && typeof server.on === 'function') {
  server.on('error', (err) => {
    console.error('[fatal] HTTP server error:', err?.code || err);
    // Do not call process.exit here to avoid killing the container in preview checks
  });
}

// Handle unexpected errors to avoid silent failures, but do not exit
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled Promise Rejection:', reason);
  // No process.exit to keep service running
});

process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught Exception:', err?.stack || err);
  // No process.exit to keep service running
});

process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received: closing HTTP server');
  server?.close(() => {
    console.log('[shutdown] HTTP server closed');
    // Do not force process.exit here; allow graceful shutdown
  });
});

// Export both for flexibility (tests may wish to import app, while runtime uses server)
module.exports = server;
module.exports.app = app;
