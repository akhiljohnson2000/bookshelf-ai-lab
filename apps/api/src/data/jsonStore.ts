import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '@bookshelf/shared';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(filePath: string): Promise<T> {
  try {
    const exists = await fileExists(filePath);
    if (!exists) {
      throw new AppError(`Data file not found: ${path.basename(filePath)}`, 500, 'DATA_FILE_NOT_FOUND');
    }

    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new AppError(
        `Invalid JSON in ${path.basename(filePath)}`,
        500,
        'INVALID_JSON',
      );
    }

    throw new AppError(
      `Failed to read ${path.basename(filePath)}`,
      500,
      'READ_ERROR',
    );
  }
}

export async function writeJson<T>(filePath: string, data: T): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const tempPath = `${filePath}.tmp`;
    const content = JSON.stringify(data, null, 2);

    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, filePath);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      `Failed to write ${path.basename(filePath)}`,
      500,
      'WRITE_ERROR',
    );
  }
}

export async function updateJson<T>(
  filePath: string,
  updater: (current: T) => T,
): Promise<T> {
  const current = await readJson<T>(filePath);
  const updated = updater(current);
  await writeJson(filePath, updated);
  return updated;
}
