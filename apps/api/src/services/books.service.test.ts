import type { Book } from '@bookshelf/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the data-access layer so tests never read the real JSON files.
// `searchBooks` only depends on `booksRepository.getAllBooks()`.
vi.mock('../data/books.repository.js', () => ({
  getAllBooks: vi.fn(),
}));

// `books.service.ts` also imports the shelves repository at module load time.
// It is unused by `searchBooks`, but we stub it so the module graph resolves
// without touching real files.
vi.mock('../data/shelves.repository.js', () => ({
  removeBookFromAllShelves: vi.fn(),
}));

import * as booksRepository from '../data/books.repository.js';
import { searchBooks } from './books.service.js';

const getAllBooksMock = vi.mocked(booksRepository.getAllBooks);

// Helper to build a full, valid Book with sensible defaults that individual
// tests can override per field.
function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book_001',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    genre: 'Technology',
    year: 1999,
    isbn: '9780201616224',
    description: 'A classic on software craftsmanship.',
    coverUrl: null,
    addedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('searchBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches books by title (case-insensitive substring)', async () => {
    // Arrange
    const books = [
      makeBook({ id: 'book_001', title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi' }),
      makeBook({ id: 'book_002', title: 'Neuromancer', author: 'William Gibson', genre: 'Sci-Fi' }),
    ];
    getAllBooksMock.mockResolvedValue(books);

    // Act
    const results = await searchBooks('dune');

    // Assert
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('book_001');
    expect(results[0].title).toBe('Dune');
  });

  it('matches books by author', async () => {
    // Arrange
    const books = [
      makeBook({ id: 'book_001', title: 'Dune', author: 'Frank Herbert' }),
      makeBook({ id: 'book_002', title: 'Children of Dune', author: 'Frank Herbert' }),
      makeBook({ id: 'book_003', title: 'Neuromancer', author: 'William Gibson' }),
    ];
    getAllBooksMock.mockResolvedValue(books);

    // Act
    const results = await searchBooks('herbert');

    // Assert
    expect(results).toHaveLength(2);
    expect(results.map((book) => book.id)).toEqual(['book_001', 'book_002']);
  });

  it('matches books by genre', async () => {
    // Arrange
    const books = [
      makeBook({ id: 'book_001', title: 'Dune', genre: 'Science Fiction' }),
      makeBook({ id: 'book_002', title: 'The Hobbit', genre: 'Fantasy' }),
      makeBook({ id: 'book_003', title: 'Foundation', genre: 'Science Fiction' }),
    ];
    getAllBooksMock.mockResolvedValue(books);

    // Act
    const results = await searchBooks('science fiction');

    // Assert
    expect(results).toHaveLength(2);
    expect(results.map((book) => book.id)).toEqual(['book_001', 'book_003']);
  });

  it('returns an empty array when nothing matches', async () => {
    // Arrange
    const books = [
      makeBook({ id: 'book_001', title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi' }),
    ];
    getAllBooksMock.mockResolvedValue(books);

    // Act
    const results = await searchBooks('nonexistent-term');

    // Assert
    expect(results).toEqual([]);
  });

  it('returns an empty array for an empty query without hitting the repository', async () => {
    // Arrange (no repository data needed)

    // Act
    const results = await searchBooks('');

    // Assert
    expect(results).toEqual([]);
    expect(getAllBooksMock).not.toHaveBeenCalled();
  });

  it('returns an empty array for a whitespace-only query without hitting the repository', async () => {
    // Arrange (no repository data needed)

    // Act
    const results = await searchBooks('   \t  ');

    // Assert
    expect(results).toEqual([]);
    expect(getAllBooksMock).not.toHaveBeenCalled();
  });

  it('treats special characters as literal text (no regex interpretation)', async () => {
    // Arrange
    const books = [
      makeBook({ id: 'book_001', title: 'C++ Primer', author: 'Stanley Lippman', genre: 'Technology' }),
      makeBook({ id: 'book_002', title: 'C Programming', author: 'Brian Kernighan', genre: 'Technology' }),
    ];
    getAllBooksMock.mockResolvedValue(books);

    // Act
    // `.*` would match everything if treated as a regex; as a literal substring
    // it matches nothing, and `c++` matches only the first title.
    const regexResults = await searchBooks('.*');
    const literalResults = await searchBooks('c++');

    // Assert
    expect(regexResults).toEqual([]);
    expect(literalResults).toHaveLength(1);
    expect(literalResults[0].id).toBe('book_001');
  });

  it('is case-insensitive across title, author, and genre', async () => {
    // Arrange
    const books = [
      makeBook({ id: 'book_001', title: 'DUNE', author: 'FRANK HERBERT', genre: 'SCI-FI' }),
    ];
    getAllBooksMock.mockResolvedValue(books);

    // Act
    const upperQuery = await searchBooks('DUNE');
    const lowerQuery = await searchBooks('frank herbert');
    const mixedGenre = await searchBooks('ScI-Fi');

    // Assert
    expect(upperQuery).toHaveLength(1);
    expect(lowerQuery).toHaveLength(1);
    expect(mixedGenre).toHaveLength(1);
  });

  it('trims surrounding whitespace before matching', async () => {
    // Arrange
    const books = [makeBook({ id: 'book_001', title: 'Dune' })];
    getAllBooksMock.mockResolvedValue(books);

    // Act
    const results = await searchBooks('   dune   ');

    // Assert
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('book_001');
  });
});
