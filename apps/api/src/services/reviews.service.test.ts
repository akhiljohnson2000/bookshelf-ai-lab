import type { Review } from '@bookshelf/shared';
import { NotFoundError } from '@bookshelf/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the data-access layer so tests never read real JSON files.
vi.mock('../data/books.repository.js', () => ({
  requireBookById: vi.fn(),
}));
vi.mock('../data/reviews.repository.js', () => ({
  getReviewsByBookId: vi.fn(),
  createReview: vi.fn(),
}));

import * as booksRepository from '../data/books.repository.js';
import * as reviewsRepository from '../data/reviews.repository.js';
import { getBookRating } from './reviews.service.js';

const requireBookByIdMock = vi.mocked(booksRepository.requireBookById);
const getReviewsByBookIdMock = vi.mocked(reviewsRepository.getReviewsByBookId);

function makeReview(rating: number, overrides: Partial<Review> = {}): Review {
  return {
    id: 'review_001',
    bookId: 'book_001',
    userId: 'user_001',
    rating,
    text: 'A review.',
    createdAt: '2026-06-15T12:00:00Z',
    ...overrides,
  };
}

describe('getBookRating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // by default the book exists
    requireBookByIdMock.mockResolvedValue(makeReview(5) as never);
  });

  it('returns average null and count 0 when there are no reviews', async () => {
    // Arrange
    getReviewsByBookIdMock.mockResolvedValue([]);

    // Act
    const result = await getBookRating('book_001');

    // Assert
    expect(result).toEqual({ bookId: 'book_001', average: null, count: 0 });
  });

  it('returns the rating itself for a single review', async () => {
    // Arrange
    getReviewsByBookIdMock.mockResolvedValue([makeReview(5)]);

    // Act
    const result = await getBookRating('book_001');

    // Assert
    expect(result).toEqual({ bookId: 'book_001', average: 5, count: 1 });
  });

  it('averages multiple ratings', async () => {
    // Arrange
    getReviewsByBookIdMock.mockResolvedValue([makeReview(5), makeReview(4)]);

    // Act
    const result = await getBookRating('book_001');

    // Assert
    expect(result).toEqual({ bookId: 'book_001', average: 4.5, count: 2 });
  });

  it('rounds the average to one decimal place', async () => {
    // Arrange — 13 / 3 = 4.333…
    getReviewsByBookIdMock.mockResolvedValue([makeReview(5), makeReview(4), makeReview(4)]);

    // Act
    const result = await getBookRating('book_001');

    // Assert
    expect(result).toEqual({ bookId: 'book_001', average: 4.3, count: 3 });
  });

  it('propagates NotFoundError when the book does not exist', async () => {
    // Arrange
    requireBookByIdMock.mockRejectedValue(new NotFoundError("Book with id 'book_999' not found"));

    // Act / Assert
    await expect(getBookRating('book_999')).rejects.toBeInstanceOf(NotFoundError);
    expect(getReviewsByBookIdMock).not.toHaveBeenCalled();
  });
});
