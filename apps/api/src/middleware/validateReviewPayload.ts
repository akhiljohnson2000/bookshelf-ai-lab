import type { NextFunction, Request, Response } from 'express';
import type { CreateReviewPayload } from '@bookshelf/shared';
import { ValidationError } from '@bookshelf/shared';

const MIN_RATING = 1;
const MAX_RATING = 5;

type FieldErrors = Partial<Record<keyof CreateReviewPayload, string>>;

export function validateReviewPayload(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const body = req.body as Record<string, unknown>;
  const errors: FieldErrors = {};

  // rating: required integer between 1 and 5
  if (body.rating === undefined || body.rating === null || body.rating === '') {
    errors.rating = 'rating is required';
  } else {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) {
      errors.rating = `rating must be an integer between ${MIN_RATING} and ${MAX_RATING}`;
    }
  }

  // text: required non-empty string
  if (typeof body.text !== 'string' || body.text.trim() === '') {
    errors.text = 'text is required';
  }

  // userId: optional string
  if (body.userId !== undefined && typeof body.userId !== 'string') {
    errors.userId = 'userId must be a string';
  }

  if (Object.keys(errors).length > 0) {
    next(new ValidationError('Invalid review payload', errors));
    return;
  }

  req.body = {
    rating: Number(body.rating),
    text: (body.text as string).trim(),
    ...(typeof body.userId === 'string' ? { userId: body.userId.trim() } : {}),
  } satisfies CreateReviewPayload;

  next();
}
