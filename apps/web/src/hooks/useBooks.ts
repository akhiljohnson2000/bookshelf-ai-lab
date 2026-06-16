import { useEffect, useState } from 'react';
import type { Book } from '@bookshelf/shared';
import { fetchBooks, searchBooks } from '../lib/api';

interface UseBooksResult {
  books: Book[];
  loading: boolean;
  error: string | null;
}

const DEBOUNCE_MS = 300;

// Loads all books, or search results when a query is provided. Debounces query
// changes so we don't fire a request on every keystroke. Empty query falls back
// to the full catalogue.
export function useBooks(query: string): UseBooksResult {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    let cancelled = false;

    setLoading(true);
    setError(null);

    const handle = setTimeout(() => {
      const load = trimmed ? searchBooks(trimmed) : fetchBooks();
      load
        .then((result) => {
          if (!cancelled) setBooks(result);
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return { books, loading, error };
}
