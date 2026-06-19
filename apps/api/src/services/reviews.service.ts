import type { BookRating, Review } from '@bookshelf/shared';
import * as booksRepository from '../data/books.repository.js';
import * as reviewsRepository from '../data/reviews.repository.js';

export async function getReviewsForBook(bookId: string): Promise<Review[]> {
  // Reject reviews for a book that doesn't exist (throws NotFoundError → 404).
  await booksRepository.requireBookById(bookId);
  return reviewsRepository.getReviewsByBookId(bookId);
}

export async function getBookRating(bookId: string): Promise<BookRating> {
  await booksRepository.requireBookById(bookId);
  const reviews = await reviewsRepository.getReviewsByBookId(bookId);

  const count = reviews.length;
  if (count === 0) {
    return { bookId, average: null, count: 0 };
  }

  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  const average = Math.round((sum / count) * 10) / 10; // 1 decimal place

  return { bookId, average, count };
}

export async function createReview(
  bookId: string,
  payload: Parameters<typeof reviewsRepository.createReview>[1],
): Promise<Review> {
  await booksRepository.requireBookById(bookId);
  return reviewsRepository.createReview(bookId, payload);
}
