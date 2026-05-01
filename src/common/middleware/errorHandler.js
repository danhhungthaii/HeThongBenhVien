const { ZodError } = require('zod');

const { AppError } = require('../errors/AppError');
const { logger } = require('../logger/logger');

function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: err.flatten(),
    });
    return;
  }

  const appError = err instanceof AppError ? err : new AppError('Internal server error', 500);

  logger.error('Request failed', {
    method: req.method,
    path: req.originalUrl,
    statusCode: appError.statusCode,
    message: appError.message,
    details: appError.details,
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    details: appError.details,
  });
}

module.exports = { errorHandler };