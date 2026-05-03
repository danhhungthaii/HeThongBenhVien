'use strict';
const rateLimit = require('express-rate-limit');

function rateLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}

const AUTH_RATE_LIMIT = () =>
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts' });

const API_RATE_LIMIT = () => rateLimiter({ windowMs: 1 * 60 * 1000, max: 60 });

module.exports = { rateLimiter, AUTH_RATE_LIMIT, API_RATE_LIMIT };
