import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/AppError';
import { logger } from '../logger/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
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
