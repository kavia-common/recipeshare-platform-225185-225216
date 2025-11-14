require('dotenv').config();

console.log('[startup] Bootstrapping server...');
const app = require('./app');

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
  process.exit(1);
}

// Ensure we exit on 'error' events from the server (e.g., EADDRINUSE)
if (server && typeof server.on === 'function') {
  server.on('error', (err) => {
    console.error('[fatal] HTTP server error:', err?.code || err);
    process.exit(1);
  });
}

// Handle unexpected errors to avoid silent failures
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught Exception:', err?.stack || err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received: closing HTTP server');
  server?.close(() => {
    console.log('[shutdown] HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
