import { useState } from 'react';
import type { Book } from '@bookshelf/shared';
import { useReviews } from '../hooks/useReviews';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
}

// Date shape comes straight from the MCP-inspected review data (ISO `createdAt`).
function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function BookDetail({ book, onClose }: BookDetailProps) {
  const { reviews, loading, error, submitting, addReview } = useReviews(book.id);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      await addReview({ rating, text: text.trim() });
      setText('');
      setRating(5);
    } catch {
      // error surfaced via the hook's `error` state
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brown-dark/40 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-cream-dark bg-white p-6 shadow-xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-forest px-3 py-1 text-xs font-medium uppercase tracking-wide text-cream">
              {book.genre}
            </span>
            <h2 className="mt-3 font-serif text-2xl font-bold text-brown-dark">{book.title}</h2>
            <p className="mt-1 text-brown">
              {book.author} · {book.year}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-2 text-2xl leading-none text-brown-light hover:text-brown-dark"
          >
            ×
          </button>
        </div>

        {book.description && <p className="mt-4 text-sm text-brown-light">{book.description}</p>}

        <hr className="my-6 border-cream-dark" />

        <h3 className="font-serif text-lg font-semibold text-brown-dark">
          Reviews {!loading && <span className="text-brown-light">({reviews.length})</span>}
        </h3>

        {loading && <p className="mt-3 text-sm text-brown-light">Loading reviews…</p>}
        {!loading && error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p className="mt-3 text-sm text-brown-light">No reviews yet. Be the first!</p>
        )}

        {!loading && reviews.length > 0 && (
          <ul className="mt-3 space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-cream-dark bg-cream/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-amber-500" aria-label={`${review.rating} out of 5`}>
                    {'★'.repeat(review.rating)}
                    <span className="text-cream-dark">{'★'.repeat(5 - review.rating)}</span>
                  </span>
                  <span className="text-xs text-brown-light">
                    {review.userId} · {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-brown">{review.text}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="rating" className="text-sm text-brown">
              Rating
            </label>
            <select
              id="rating"
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="rounded-lg border border-cream-dark bg-white px-3 py-1 text-sm text-brown-dark"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} ★
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className="w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm text-brown-dark placeholder:text-brown-light focus:outline-none focus:ring-2 focus:ring-forest"
          />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-cream transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add review'}
          </button>
        </form>
      </div>
    </div>
  );
}
