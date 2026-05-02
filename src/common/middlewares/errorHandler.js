const { ZodError } = require('zod');

const { AppError } = require('../errors/AppError');
const { logger } = require('../helpers/logger');

function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details = err.details || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    details = err.flatten();
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    // Map status codes to conventional codes
    if (statusCode === 400) code = 'VALIDATION_ERROR';
    else if (statusCode === 401) code = 'UNAUTHORIZED';
    else if (statusCode === 403) code = 'FORBIDDEN';
    else if (statusCode === 404) code = 'NOT_FOUND';
    else if (statusCode === 409) code = 'CONFLICT';
  }

  logger.error(message, {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}

module.exports = { errorHandler };