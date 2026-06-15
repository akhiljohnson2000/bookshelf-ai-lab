import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(findRepoRoot(__dirname), '.env') });

function findRepoRoot(startDir: string): string {
  let dir = startDir;

  while (true) {
    const dataFile = path.join(dir, 'data', 'books.json');
    if (fs.existsSync(dataFile)) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return startDir;
}

const repoRoot = findRepoRoot(__dirname);

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  apiBasePath: process.env.API_BASE_PATH ?? '/api',
  dataDir: path.resolve(repoRoot, process.env.DATA_DIR ?? './data'),
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
} as const;

export const dataFiles = {
  books: path.join(config.dataDir, 'books.json'),
  shelves: path.join(config.dataDir, 'shelves.json'),
  reviews: path.join(config.dataDir, 'reviews.json'),
} as const;
