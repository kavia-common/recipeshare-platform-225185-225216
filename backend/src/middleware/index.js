const { authenticate, requireOwnership } = require('./auth');

// This file will export middleware as the application grows
module.exports = {
  authenticate,
  requireOwnership,
};
