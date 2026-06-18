import type { Shelf } from '@bookshelf/shared';
import { dataFiles } from '../config/index.js';
import { readJson, updateJson } from './jsonStore.js';

export async function getAllShelves(): Promise<Shelf[]> {
  return readJson<Shelf[]>(dataFiles.shelves);
}

/**
 * Removes a bookId from every shelf that contains it.
 * Returns the number of shelves that were affected.
 */
export async function removeBookFromAllShelves(bookId: string): Promise<number> {
  let affected = 0;

  await updateJson<Shelf[]>(dataFiles.shelves, (shelves) => {
    return shelves.map((shelf) => {
      if (!shelf.bookIds.includes(bookId)) {
        return shelf;
      }

      affected += 1;
      return { ...shelf, bookIds: shelf.bookIds.filter((id) => id !== bookId) };
    });
  });

  return affected;
}
