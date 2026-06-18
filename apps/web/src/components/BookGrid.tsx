import type { Book } from '@bookshelf/shared';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: Book[];
  onSelect: (book: Book) => void;
}

export function BookGrid({ books, onSelect }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onSelect={onSelect} />
      ))}
    </div>
  );
}
