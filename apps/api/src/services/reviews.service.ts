import type { Review } from '@bookshelf/shared';
import * as booksRepository from '../data/books.repository.js';
import * as reviewsRepository from '../data/reviews.repository.js';

export async function getReviewsForBook(bookId: string): Promise<Review[]> {
  // Reject reviews for a book that doesn't exist (throws NotFoundError → 404).
  await booksRepository.requireBookById(bookId);
  return reviewsRepository.getReviewsByBookId(bookId);
}

export async function createReview(
  bookId: string,
  payload: Parameters<typeof reviewsRepository.createReview>[1],
): Promise<Review> {
  await booksRepository.requireBookById(bookId);
  return reviewsRepository.createReview(bookId, payload);
}
