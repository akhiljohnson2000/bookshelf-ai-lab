import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Book, Shelf } from '@bookshelf/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Walk up from this module until we find the repo's `data/books.json`.
 * Lets the server be launched from any cwd (e.g. by an MCP client).
 * Override with the BOOKSHELF_DATA_DIR env var.
 */
function findDataDir(): string {
  if (process.env.BOOKSHELF_DATA_DIR) {
    return path.resolve(process.env.BOOKSHELF_DATA_DIR);
  }

  let dir = __dirname;
  while (true) {
    if (existsSync(path.join(dir, 'data', 'books.json'))) {
      return path.join(dir, 'data');
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error('Could not locate the BookShelf data directory (data/books.json).');
    }
    dir = parent;
  }
}

const dataDir = findDataDir();

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(dataDir, file), 'utf-8');
  return JSON.parse(raw) as T;
}

export function getBooks(): Promise<Book[]> {
  return readJson<Book[]>('books.json');
}

export function getShelves(): Promise<Shelf[]> {
  return readJson<Shelf[]>('shelves.json');
}
