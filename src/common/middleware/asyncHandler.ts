import type { RequestHandler } from 'express';

export const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
};
