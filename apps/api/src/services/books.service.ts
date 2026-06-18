import type { Book, BookFilters, BookQueryParams, PaginatedResponse } from '@bookshelf/shared';
import * as booksRepository from '../data/books.repository.js';
import * as shelvesRepository from '../data/shelves.repository.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function listBooks(
  params: BookQueryParams,
): Promise<PaginatedResponse<Book>> {
  const page = normalizePage(params.page);
  const limit = normalizeLimit(params.limit);

  let books = await booksRepository.getAllBooks();
  books = applyFilters(books, params);

  const total = books.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;
  const data = books.slice(offset, offset + limit);

  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getBook(id: string): Promise<Book> {
  return booksRepository.requireBookById(id);
}

export async function createBook(
  payload: Parameters<typeof booksRepository.createBook>[0],
): Promise<Book> {
  return booksRepository.createBook(payload);
}

export async function updateBook(
  id: string,
  payload: Parameters<typeof booksRepository.updateBook>[1],
): Promise<Book> {
  return booksRepository.updateBook(id, payload);
}

export async function deleteBook(id: string): Promise<{ id: string; removedFromShelves: number }> {
  await booksRepository.deleteBook(id);
  const removedFromShelves = await shelvesRepository.removeBookFromAllShelves(id);
  return { id, removedFromShelves };
}

export async function searchBooks(query: string): Promise<Book[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const books = await booksRepository.getAllBooks();

  return books.filter((book) => {
    return (
      book.title.toLowerCase().includes(normalizedQuery) ||
      book.author.toLowerCase().includes(normalizedQuery) ||
      book.genre.toLowerCase().includes(normalizedQuery)
    );
  });
}

function applyFilters(books: Book[], filters: BookFilters): Book[] {
  return books.filter((book) => {
    if (filters.genre && book.genre.toLowerCase() !== filters.genre.toLowerCase()) {
      return false;
    }

    if (
      filters.author &&
      !book.author.toLowerCase().includes(filters.author.toLowerCase())
    ) {
      return false;
    }

    if (filters.year !== undefined && book.year !== filters.year) {
      return false;
    }

    return true;
  });
}

function normalizePage(page?: number): number {
  if (!page || page < 1) return DEFAULT_PAGE;
  return Math.floor(page);
}

function normalizeLimit(limit?: number): number {
  if (!limit || limit < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(limit), MAX_LIMIT);
}
