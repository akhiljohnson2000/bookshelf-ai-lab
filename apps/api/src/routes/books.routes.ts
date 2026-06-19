import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@bookshelf/shared';
import * as booksService from '../services/books.service.js';
import * as reviewsService from '../services/reviews.service.js';
import { validateBookPayload } from '../middleware/validateBookPayload.js';
import { validateReviewPayload } from '../middleware/validateReviewPayload.js';

const router = Router();

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q;
    if (typeof q !== 'string' || !q.trim()) {
      throw new ValidationError('Query parameter "q" is required');
    }

    const results = await booksService.searchBooks(q);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const genre = typeof req.query.genre === 'string' ? req.query.genre : undefined;
    const author = typeof req.query.author === 'string' ? req.query.author : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const result = await booksService.listBooks({ page, limit, genre, author, year });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const book = await booksService.getBook(id);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateBookPayload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await booksService.createBook(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateBookPayload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const book = await booksService.updateBook(id, req.body);
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const result = await booksService.deleteBook(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await reviewsService.getReviewsForBook(String(req.params.id));
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/rating', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rating = await reviewsService.getBookRating(String(req.params.id));
    res.json({ success: true, data: rating });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:id/reviews',
  validateReviewPayload,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await reviewsService.createReview(String(req.params.id), req.body);
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
