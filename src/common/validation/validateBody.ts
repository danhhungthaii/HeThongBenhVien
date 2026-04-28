import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';

import { AppError } from '../errors/AppError';

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError('Validation failed', 400, result.error.flatten()));
      return;
    }

    req.body = result.data as typeof req.body;
    next();
  };
}
