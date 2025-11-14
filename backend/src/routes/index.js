const express = require('express');
const healthController = require('../controllers/health');

// NOTE: recipes router intentionally not required during startup isolation.
// const recipesRouter = require('./recipes');

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

const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';
router.get(healthPath, healthController.check.bind(healthController));

// Temporarily bypass recipes mount to isolate startup issues
// router.use(recipesRouter);

module.exports = router;
