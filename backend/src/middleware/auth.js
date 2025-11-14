'use strict';

const jwt = require('jsonwebtoken');

/**
 * PUBLIC_INTERFACE
 * authenticate
 * Express middleware that extracts the current user from an Authorization: Bearer <jwt> header.
 * This is a placeholder compatible with NextAuth JWT where token contains id, email, name.
 * If no valid token is provided, responds with 401 in production; in development without NEXTAUTH_SECRET it no-ops.
 * Note: process.env access happens at request-time, not at import-time, avoiding startup crashes.
 */
function authenticate(req, res, next) {
  const secret = process.env.NEXTAUTH_SECRET;
  const isDev = (process.env.NODE_ENV || 'development') === 'development';

  if (!secret && isDev) {
    req.user = req.user || { id: 'dev-user', email: 'dev@example.com', name: 'Dev User' };
    return next();
  }

  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!secret) {
      return res.status(500).json({ error: 'Server auth misconfiguration' });
    }
    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * PUBLIC_INTERFACE
 * requireOwnership
 * Checks if the authenticated user is the owner (author) of the resource loaded on req.recipe by previous middleware.
 */
function requireOwnership(req, res, next) {
  if (!req.user || !req.recipe) {
    return res.status(500).json({ error: 'Ownership check misconfigured' });
  }
  if (req.recipe.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: not the author' });
  }
  return next();
}

module.exports = {
  authenticate,
  requireOwnership,
};
