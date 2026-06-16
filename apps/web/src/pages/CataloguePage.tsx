import { useState } from 'react';
import { useBooks } from '../hooks/useBooks';
import { SearchBar } from '../components/SearchBar';
import { BookGrid } from '../components/BookGrid';

export function CataloguePage() {
  const [query, setQuery] = useState('');
  const { books, loading, error } = useBooks(query);

  return (
    <div className="min-h-screen">
      <header className="border-b border-cream-dark bg-cream-dark/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brown-dark sm:text-4xl">
              BookShelf
            </h1>
            <p className="mt-1 text-brown-light">Browse and search the catalogue.</p>
          </div>
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading && <StatusMessage>Loading books…</StatusMessage>}

        {!loading && error && (
          <StatusMessage tone="error">{error}</StatusMessage>
        )}

        {!loading && !error && books.length === 0 && (
          <StatusMessage>
            {query.trim()
              ? `No books match “${query.trim()}”.`
              : 'No books in the catalogue yet.'}
          </StatusMessage>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <p className="mb-5 text-sm text-brown-light">
              {books.length} {books.length === 1 ? 'book' : 'books'}
            </p>
            <BookGrid books={books} />
          </>
        )}
      </main>
    </div>
  );
}

interface StatusMessageProps {
  children: React.ReactNode;
  tone?: 'default' | 'error';
}

function StatusMessage({ children, tone = 'default' }: StatusMessageProps) {
  const color = tone === 'error' ? 'text-red-700' : 'text-brown';
  return (
    <div className={`rounded-2xl border border-cream-dark bg-white p-8 text-center ${color}`}>
      {children}
    </div>
  );
}
