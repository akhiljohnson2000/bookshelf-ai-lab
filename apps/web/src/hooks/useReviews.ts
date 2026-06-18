import { useEffect, useState } from 'react';
import type { CreateReviewPayload, Review } from '@bookshelf/shared';
import { createReview, fetchReviews } from '../lib/api';

interface UseReviewsResult {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addReview: (payload: CreateReviewPayload) => Promise<void>;
}

// Loads the reviews for one book and exposes an addReview action that posts a
// new review and appends the created review to the list on success.
export function useReviews(bookId: string): UseReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchReviews(bookId)
      .then((result) => {
        if (!cancelled) setReviews(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load reviews');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function addReview(payload: CreateReviewPayload): Promise<void> {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createReview(bookId, payload);
      setReviews((current) => [...current, created]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  return { reviews, loading, error, submitting, addReview };
}
