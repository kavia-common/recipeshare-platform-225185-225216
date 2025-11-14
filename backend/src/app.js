require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Startup diagnostics: log each major stage
console.log('[startup] Loading app.js...');
let app;
try {
  app = express();
  console.log('[startup] Express instance created');
} catch (e) {
  console.error('[startup] Failed to create Express app', e);
  throw e;
}

// Basic, safe middleware only
try {
  app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
  console.log('[startup] CORS middleware registered');
  app.set('trust proxy', true);
  app.use(express.json());
  console.log('[startup] JSON parser registered');
} catch (e) {
  console.error('[startup] Failed registering middleware', e);
  throw e;
}

// PUBLIC_INTERFACE
// Health route - always returns 200 and never references optional envs
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// PUBLIC_INTERFACE
// Minimal root route for quick smoke test
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'FlavorFolio backend (minimal boot)',
    timestamp: new Date().toISOString(),
  });
});

// Temporary: bypass mounting of complex routers (recipes/auth/etc) to isolate startup faults
// Add diagnostic logs to clarify this is intentional
console.log('[startup] Skipping recipes router mount temporarily for isolation');

// Optional: Swagger can pull in dynamic requires; skip for now during isolation
console.log('[startup] Skipping Swagger mounting during isolation');

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[error] Unhandled error middleware caught:', err?.stack || err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

module.exports = app;
