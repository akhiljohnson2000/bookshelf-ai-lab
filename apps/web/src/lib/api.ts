import type { Book } from '@bookshelf/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`);
  } catch {
    throw new Error('Could not reach the API. Is the server running?');
  }

  const body = (await res.json()) as Envelope<T>;
  if (!res.ok || !body.success || body.data === undefined) {
    throw new Error(body.error?.message ?? `Request failed (${res.status})`);
  }

  return body.data;
}

// GET /api/books defaults to limit=10, so request a high limit to load the full catalogue.
export function fetchBooks(): Promise<Book[]> {
  return request<Book[]>('/books?limit=100');
}

export function searchBooks(query: string): Promise<Book[]> {
  return request<Book[]>(`/books/search?q=${encodeURIComponent(query)}`);
}
