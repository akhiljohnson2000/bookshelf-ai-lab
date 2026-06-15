import type { NextFunction, Request, Response } from 'express';
import type { AppError } from '@bookshelf/shared';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = 'statusCode' in err && typeof (err as AppError).statusCode === 'number';
  const statusCode = isAppError ? (err as AppError).statusCode : 500;
  const code = isAppError ? (err as AppError).code : 'INTERNAL_ERROR';
  const details = isAppError ? (err as AppError).details : undefined;

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    statusCode >= 500 && isProduction
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred';

  const body: Record<string, unknown> = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details !== undefined && !isProduction && { details }),
    },
  };

  res.status(statusCode).json(body);
}
