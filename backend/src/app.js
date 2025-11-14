require('dotenv').config();

const express = require('express');

console.log('[startup] Loading app.js (ultra-minimal)...');
const app = express();

// Only essential middleware to isolate startup
app.use(express.json());

// PUBLIC_INTERFACE
app.get('/', (req, res) => {
  /** Basic ping route for startup verification */
  res.status(200).send('OK: FlavorFolio minimal root');
});

// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  /** Health endpoint that always returns 200 */
  res.status(200).send('ok');
});

// Temporarily comment out all other middleware/routers to isolate startup
// Example (commented intentionally):
// const routes = require('./routes');
// app.use('/', routes);
// const recipesRouter = require('./routes/recipes');
// app.use(recipesRouter);

// Skip Swagger, CORS, Auth, Prisma initialization, file uploads, etc. during isolation

// Keep a very simple error handler (should not be needed with minimal routes)
app.use((err, req, res, next) => {
  console.error('[error] Caught in minimal app:', err?.stack || err);
  res.status(500).send('error');
});

module.exports = app;
