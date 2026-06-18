import type { Book } from '@bookshelf/shared';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

export function BookCard({ book, onSelect }: BookCardProps) {
  return (
    <article
      onClick={() => onSelect(book)}
      className="flex h-full cursor-pointer flex-col rounded-2xl border border-cream-dark bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full bg-forest px-3 py-1 text-xs font-medium uppercase tracking-wide text-cream">
          {book.genre}
        </span>
        <span className="shrink-0 text-sm text-brown-light">{book.year}</span>
      </div>

      <h2 className="font-serif text-lg font-semibold leading-snug text-brown-dark">
        {book.title}
      </h2>
      <p className="mt-1 text-sm text-brown">{book.author}</p>

      {book.description && (
        <p className="mt-3 line-clamp-3 text-sm text-brown-light">{book.description}</p>
      )}
    </article>
  );
}
