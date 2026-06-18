import type { Book, CreateReviewPayload, Review } from '@bookshelf/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error('Could not reach the API. Is the server running?');
  }

  const body = (await res.json()) as Envelope<T>;
  if (!res.ok || !body.success || body.data === undefined) {
    throw new Error(body.error?.message ?? `Request failed (${res.status})`);
  }

  return body.data;
}

function post<T>(path: string, payload: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// GET /api/books defaults to limit=10, so request a high limit to load the full catalogue.
export function fetchBooks(): Promise<Book[]> {
  return request<Book[]>('/books?limit=100');
}

export function searchBooks(query: string): Promise<Book[]> {
  return request<Book[]>(`/books/search?q=${encodeURIComponent(query)}`);
}

export function fetchReviews(bookId: string): Promise<Review[]> {
  return request<Review[]>(`/books/${bookId}/reviews`);
}

export function createReview(bookId: string, payload: CreateReviewPayload): Promise<Review> {
  return post<Review>(`/books/${bookId}/reviews`, payload);
}
