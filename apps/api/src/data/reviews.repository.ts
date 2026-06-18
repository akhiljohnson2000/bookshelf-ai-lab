import type { CreateReviewPayload, Review } from '@bookshelf/shared';
import { dataFiles } from '../config/index.js';
import { readJson, updateJson } from './jsonStore.js';

const DEFAULT_USER_ID = 'user_001';

export async function getAllReviews(): Promise<Review[]> {
  return readJson<Review[]>(dataFiles.reviews);
}

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  const reviews = await getAllReviews();
  return reviews.filter((review) => review.bookId === bookId);
}

export async function createReview(
  bookId: string,
  payload: CreateReviewPayload,
): Promise<Review> {
  let createdReview: Review | undefined;

  await updateJson<Review[]>(dataFiles.reviews, (reviews) => {
    createdReview = {
      id: generateNextReviewId(reviews),
      bookId,
      userId: payload.userId ?? DEFAULT_USER_ID,
      rating: payload.rating,
      text: payload.text,
      createdAt: new Date().toISOString(),
    };

    return [...reviews, createdReview];
  });

  return createdReview!;
}

function generateNextReviewId(reviews: Review[]): string {
  const maxNum = reviews.reduce((max, review) => {
    const match = review.id.match(/^review_(\d+)$/);
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);

  return `review_${String(maxNum + 1).padStart(3, '0')}`;
}
