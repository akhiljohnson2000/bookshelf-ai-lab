import type { NextFunction, Request, Response } from 'express';
import type { CreateBookPayload } from '@bookshelf/shared';
import { ValidationError } from '@bookshelf/shared';

const TITLE_MAX_LENGTH = 200;
const MIN_YEAR = 1000;

type FieldErrors = Partial<Record<keyof CreateBookPayload, string>>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

export function validateBookPayload(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const body = req.body as Record<string, unknown>;
  const errors: FieldErrors = {};

  // title: required string, max 200 chars
  if (!isNonEmptyString(body.title)) {
    errors.title = 'title is required';
  } else if (body.title.trim().length > TITLE_MAX_LENGTH) {
    errors.title = `title must be ${TITLE_MAX_LENGTH} characters or fewer`;
  }

  // author: required string
  if (!isNonEmptyString(body.author)) {
    errors.author = 'author is required';
  }

  // genre: required string
  if (!isNonEmptyString(body.genre)) {
    errors.genre = 'genre is required';
  }

  // year: required integer between 1000 and current year + 1
  const maxYear = new Date().getFullYear() + 1;
  if (body.year === undefined || body.year === null || body.year === '') {
    errors.year = 'year is required';
  } else {
    const year = Number(body.year);
    if (!Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
      errors.year = `year must be an integer between ${MIN_YEAR} and ${maxYear}`;
    }
  }

  // isbn: required string
  if (!isNonEmptyString(body.isbn)) {
    errors.isbn = 'isbn is required';
  }

  // description: required string
  if (!isNonEmptyString(body.description)) {
    errors.description = 'description is required';
  }

  // coverUrl: optional string or null
  if (
    body.coverUrl !== undefined &&
    body.coverUrl !== null &&
    typeof body.coverUrl !== 'string'
  ) {
    errors.coverUrl = 'coverUrl must be a string or null';
  }

  if (Object.keys(errors).length > 0) {
    next(new ValidationError('Invalid book payload', errors));
    return;
  }

  req.body = {
    title: (body.title as string).trim(),
    author: (body.author as string).trim(),
    genre: (body.genre as string).trim(),
    year: Number(body.year),
    isbn: (body.isbn as string).trim(),
    description: (body.description as string).trim(),
    coverUrl:
      body.coverUrl === undefined || body.coverUrl === null
        ? null
        : (body.coverUrl as string),
  } satisfies CreateBookPayload;

  next();
}
