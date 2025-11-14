const express = require('express');
const healthController = require('../controllers/health');

// Import recipes router (uses lazy Prisma and protected auth where configured)
const recipesRouter = require('./recipes');

const router = express.Router();

/**
 * Keep routes here for non-health endpoints only.
 * Health routes are already registered directly in app.js before any middleware.
 */

// Example: in-router health fallback if needed by docs
router.get('/', healthController.check.bind(healthController));
router.get('/health', healthController.check.bind(healthController));
router.get('/api/health', healthController.check.bind(healthController));

/**
 * PUBLIC_INTERFACE
 * Mount recipes routes under root so they expose /api/recipes endpoints.
 * Includes a public GET /api/recipes for verification.
 */
router.use(recipesRouter);

module.exports = router;
