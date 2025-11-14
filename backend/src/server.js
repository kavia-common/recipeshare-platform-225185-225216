require('dotenv').config();

console.log('[startup] Requiring app...');
const app = require('./app');
console.log('[startup] App required successfully');

const preferredPort = parseInt(process.env.REACT_APP_PORT || '', 10);
const envPort = parseInt(process.env.PORT || '', 10);
// Default to 3001 per contract
const PORT = Number.isFinite(preferredPort) ? preferredPort : (Number.isFinite(envPort) ? envPort : 3001);
const HOST = process.env.HOST || '0.0.0.0';

// Ensure health route exists (idempotent) and log binding details
const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';
try {
  app.get(healthPath, (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });
  console.log(`[startup] Health route ensured at ${healthPath}`);
} catch (e) {
  console.warn('[startup] Health route ensure failed (possibly already mounted):', e?.message);
}

let server;
try {
  server = app.listen(PORT, HOST, () => {
    const urlHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
    console.log(`[startup] Express server READY at http://${urlHost}:${PORT}`);
    console.log(`[startup] Healthcheck: http://${urlHost}:${PORT}${healthPath}`);
    console.log(`[startup] BIND OK -> ${HOST}:${PORT}`);
    console.log('READY'); // explicit READY marker for orchestrator
  });
} catch (e) {
  console.error('[startup] Failed to start server:', e);
  throw e;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received: closing HTTP server');
  server?.close(() => {
    console.log('[shutdown] HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
