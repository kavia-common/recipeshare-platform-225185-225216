'use strict';

const { createClient } = require('@supabase/supabase-js');

/**
 * Create a Supabase service client lazily from env. If env is missing, return null
 * so middleware can be safely skipped without breaking startup.
 */
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return null;
  try {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (_e) {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * supabaseAuthenticate
 * Express middleware that authenticates requests using a Supabase Bearer token.
 * - Expects Authorization: Bearer <jwt>
 * - Verifies via supabase.auth.getUser(token)
 * - On success attaches req.user = { id, email, name }
 * - If Supabase env is not configured, calls next() with no user, allowing fallback auth to handle.
 */
async function supabaseAuthenticate(req, res, next) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase not configured: proceed and let other auth handle
    return next();
  }

  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = data.user;
    req.user = {
      id: user.id,
      email: user.email || undefined,
      name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = {
  supabaseAuthenticate,
  getSupabaseAdmin,
};
