const express = require('express');
const healthController = require('../controllers/health');

// Import recipes router (uses lazy Prisma and protected auth where configured)
const recipesRouter = require('./recipes');

const router = express.Router();

/**
 * Keep routes here for non-health endpoints only.
 * Health routes are already registered directly in app.js before any middleware.
 */

/**
 * Health routes are already defined in app.js and registered before any middleware.
 * Keep only explicit fallbacks for /api/health to avoid overriding '/' root handler.
 */
router.get('/api/health', healthController.check.bind(healthController));
router.get('/readyz', (req, res) => res.status(200).json({ status: 'ok' }));
router.get('/livez', (req, res) => res.status(200).json({ status: 'ok' }));

/**
 * PUBLIC_INTERFACE
 * Mount recipes routes under root so they expose /api/recipes endpoints.
 * Includes a public GET /api/recipes for verification.
 */
router.use(recipesRouter);

module.exports = router;
