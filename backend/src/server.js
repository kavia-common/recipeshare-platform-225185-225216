require('dotenv').config();

console.log('[startup] Bootstrapping server...');
const app = require('./app');

const envPort = parseInt(process.env.PORT || '', 10);
const PORT = Number.isFinite(envPort) ? envPort : 3001; // force default 3001 if unset
const HOST = process.env.HOST || '0.0.0.0';

console.log(`[startup] About to bind Express on ${HOST}:${PORT}...`);
const server = app.listen(PORT, HOST, () => {
  const urlHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`[startup] Express listening at http://${urlHost}:${PORT}`);
  console.log('[startup] Bind successful.');
});

process.on('SIGTERM', () => {
  console.log('[shutdown] SIGTERM received: closing HTTP server');
  server?.close(() => {
    console.log('[shutdown] HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
