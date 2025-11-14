require('dotenv').config(); // Load environment variables from .env

const app = require('./app');

// Determine port preference:
// - Prefer REACT_APP_PORT if provided (used by environment)
// - Fallback to PORT
// - Default to 3001 per container contract
const preferredPort = parseInt(process.env.REACT_APP_PORT || '', 10);
const envPort = parseInt(process.env.PORT || '', 10);
const PORT = Number.isFinite(preferredPort)
  ? preferredPort
  : Number.isFinite(envPort)
    ? envPort
    : 3001;

const HOST = process.env.HOST || '0.0.0.0';

// Ensure a healthcheck route exists and responds 200
const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';
app.get(healthPath, (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

const server = app.listen(PORT, HOST, () => {
  const urlHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`[startup] Express server ready at http://${urlHost}:${PORT}`);
  console.log(`[startup] Healthcheck: http://${urlHost}:${PORT}${healthPath}`);
  console.log(`[startup] Routes registered and server is listening on ${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
