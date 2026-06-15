import type { Book, CreateBookPayload } from '@bookshelf/shared';
import { ConflictError, NotFoundError } from '@bookshelf/shared';
import { dataFiles } from '../config/index.js';
import { readJson, updateJson } from './jsonStore.js';

export async function getAllBooks(): Promise<Book[]> {
  return readJson<Book[]>(dataFiles.books);
}

export async function getBookById(id: string): Promise<Book | null> {
  const books = await getAllBooks();
  return books.find((book) => book.id === id) ?? null;
}

export async function createBook(payload: CreateBookPayload): Promise<Book> {
  let createdBook: Book | undefined;

  await updateJson<Book[]>(dataFiles.books, (books) => {
    const duplicateIsbn = books.some((book) => book.isbn === payload.isbn);
    if (duplicateIsbn) {
      throw new ConflictError(`A book with ISBN ${payload.isbn} already exists`);
    }

    createdBook = {
      id: generateNextBookId(books),
      title: payload.title,
      author: payload.author,
      genre: payload.genre,
      year: payload.year,
      isbn: payload.isbn,
      description: payload.description,
      coverUrl: payload.coverUrl ?? null,
      addedAt: new Date().toISOString(),
    };

    return [...books, createdBook];
  });

  return createdBook!;
}

function generateNextBookId(books: Book[]): string {
  const maxNum = books.reduce((max, book) => {
    const match = book.id.match(/^book_(\d+)$/);
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);

  return `book_${String(maxNum + 1).padStart(3, '0')}`;
}

export async function requireBookById(id: string): Promise<Book> {
  const book = await getBookById(id);
  if (!book) {
    throw new NotFoundError(`Book with id '${id}' not found`);
  }
  return book;
}
