/**
 * securityMiddleware.js
 *
 * Three security layers implemented without external packages:
 *
 *  1. securityHeaders  — helmet-like HTTP security headers
 *  2. sanitizeInput    — XSS + MongoDB-injection sanitizer
 *  3. createRateLimiter — configurable in-memory rate limiter
 *
 * Usage in server.js:
 *   const { securityHeaders, sanitizeInput, createRateLimiter } = require('./middleware/securityMiddleware');
 *   app.use(securityHeaders);
 *   app.use(sanitizeInput);
 *   // On specific routes:
 *   router.post('/login', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), loginRules, login);
 */

// ─────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS  (helmet replacement)
// ─────────────────────────────────────────────────────────────

/**
 * Sets secure HTTP headers on every response to prevent common
 * web vulnerabilities: clickjacking, MIME sniffing, XSS via browser.
 */
const securityHeaders = (req, res, next) => {
  // Prevent the page from being embedded in an iframe (clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');

  // Stop browsers from guessing the content type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable browser's built-in XSS filter (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Restrict what external resources the page can load
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
  );

  // Force HTTPS in production (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Don't send referrer info to other origins
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict browser features (camera, microphone, geolocation, etc.)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Remove the X-Powered-By header that reveals the tech stack
  res.removeHeader('X-Powered-By');

  next();
};

// ─────────────────────────────────────────────────────────────
// 2. INPUT SANITIZER  (xss-clean + express-mongo-sanitize replacement)
// ─────────────────────────────────────────────────────────────

/**
 * Recursively strip dangerous content from a value:
 *  - MongoDB operator injection: keys starting with $ or containing .
 *  - XSS: HTML tags and common script injection patterns
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return value
      // Remove HTML tags (XSS prevention)
      .replace(/<[^>]*>/g, '')
      // Remove dangerous HTML event attributes
      .replace(/on\w+\s*=/gi, '')
      // Remove javascript: protocol injections
      .replace(/javascript:/gi, '')
      // Remove data: URI injections
      .replace(/data:/gi, '')
      // Neutralise backtick template literals used in injections
      .replace(/`/g, '&#96;')
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }

  return value;
};

/**
 * Strip MongoDB operator injection from object keys.
 * Keys starting with '$' or containing '.' are removed entirely.
 */
const sanitizeObject = (obj) => {
  const clean = {};
  for (const key of Object.keys(obj)) {
    // Drop MongoDB operator keys ($where, $gt, $ne, etc.)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeValue(obj[key]);
  }
  return clean;
};

/**
 * Express middleware: sanitizes req.body, req.query, and req.params.
 * Applied globally — protects every endpoint at once.
 */
const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// 3. RATE LIMITER  (express-rate-limit replacement)
// ─────────────────────────────────────────────────────────────

/**
 * In-memory store for rate limiting.
 * Each key is an IP address; the value is { count, resetAt }.
 * A single cleanup timer runs every minute to prevent unbounded growth.
 */
const rateLimitStore = new Map();

// Cleanup expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now >= record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000);

/**
 * Factory function — returns a configured rate-limit middleware.
 *
 * @param {object} options
 * @param {number} options.windowMs   Time window in ms  (default: 15 min)
 * @param {number} options.max        Max requests allowed per window (default: 100)
 * @param {string} options.message    Error message when limit is hit
 *
 * @example
 * // Max 5 login attempts per 15 minutes:
 * router.post('/login', createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 }), login);
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max      = 100,
  message  = 'Too many requests. Please try again later.',
} = {}) => {
  return (req, res, next) => {
    // Use IP address as the rate-limit key
    const ip  = req.ip || req.connection?.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now >= record.resetAt) {
      // First request in this window (or window has expired)
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      setRateLimitHeaders(res, 1, max, now + windowMs);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      setRateLimitHeaders(res, record.count, max, record.resetAt);
      return res.status(429).json({ success: false, message });
    }

    setRateLimitHeaders(res, record.count, max, record.resetAt);
    next();
  };
};

/** Adds standard rate-limit response headers */
const setRateLimitHeaders = (res, count, max, resetAt) => {
  res.setHeader('X-RateLimit-Limit',     max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
  res.setHeader('X-RateLimit-Reset',     Math.ceil(resetAt / 1000)); // Unix timestamp
};

// ─────────────────────────────────────────────────────────────
// Pre-configured rate limiters for convenience
// ─────────────────────────────────────────────────────────────

/** Strict limiter for login: 5 attempts per 15 minutes */
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  'Too many login attempts. Please wait 15 minutes before trying again.',
});

/** Moderate limiter for registration: 10 per hour */
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max:      10,
  message:  'Too many registration attempts from this IP. Please try again later.',
});

/** Limiter for OTP/password-reset: 5 per 15 minutes */
const otpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  'Too many password reset attempts. Please wait 15 minutes.',
});

/** General API limiter: 200 requests per 15 minutes */
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max:      200,
  message:  'Too many requests from this IP. Please slow down.',
});

module.exports = {
  securityHeaders,
  sanitizeInput,
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  otpLimiter,
  generalLimiter,
};
