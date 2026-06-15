import type { NextFunction, Request, Response } from 'express';
import type { CreateBookPayload } from '@bookshelf/shared';
import { ValidationError } from '@bookshelf/shared';

const REQUIRED_FIELDS: (keyof CreateBookPayload)[] = [
  'title',
  'author',
  'genre',
  'year',
  'isbn',
  'description',
];

export function validateBookPayload(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const body = req.body as Record<string, unknown>;
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`${field} is required`);
    }
  }

  if (body.title !== undefined && typeof body.title !== 'string') {
    errors.push('title must be a string');
  }

  if (body.author !== undefined && typeof body.author !== 'string') {
    errors.push('author must be a string');
  }

  if (body.genre !== undefined && typeof body.genre !== 'string') {
    errors.push('genre must be a string');
  }

  if (body.year !== undefined) {
    const year = Number(body.year);
    if (!Number.isInteger(year) || year < 1000 || year > new Date().getFullYear() + 1) {
      errors.push('year must be a valid integer');
    }
  }

  if (body.isbn !== undefined && typeof body.isbn !== 'string') {
    errors.push('isbn must be a string');
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description must be a string');
  }

  if (
    body.coverUrl !== undefined &&
    body.coverUrl !== null &&
    typeof body.coverUrl !== 'string'
  ) {
    errors.push('coverUrl must be a string or null');
  }

  if (errors.length > 0) {
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
