export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn: string;
  description: string;
  coverUrl: string | null;
  addedAt: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  genre: string;
  year: number;
  isbn: string;
  description: string;
  coverUrl?: string | null;
}

export interface Shelf {
  id: string;
  userId: string;
  name: string;
  bookIds: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  rating: number;
  text: string;
  userId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | PaginatedResponse<T> | ErrorResponse;

export interface BookFilters {
  genre?: string;
  author?: string;
  year?: number;
}

export interface BookQueryParams extends BookFilters {
  page?: number;
  limit?: number;
}
