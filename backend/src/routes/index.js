const express = require('express');
const healthController = require('../controllers/health');

// Import recipes router (uses lazy Prisma and protected auth where configured)
const recipesRouter = require('./recipes');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Maintain compatibility with env-configurable health path
const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';
router.get(healthPath, healthController.check.bind(healthController));

/**
 * PUBLIC_INTERFACE
 * GET /api/health
 * Standard JSON health endpoint for container readiness checks.
 */
router.get('/api/health', healthController.check.bind(healthController));

/**
 * PUBLIC_INTERFACE
 * Mount recipes routes under root so they expose /api/recipes endpoints.
 * Includes a public GET /api/recipes for verification.
 */
router.use(recipesRouter);

module.exports = router;
