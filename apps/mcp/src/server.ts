import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getBooks, getShelves } from './data.js';

const server = new McpServer({
  name: 'bookshelf',
  version: '1.0.0',
});

/** Helper: wrap any JSON-serialisable value as MCP text content. */
function json(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] };
}

server.registerTool(
  'query_books',
  {
    title: 'Query books',
    description:
      'Search the BookShelf catalogue by a free-text query matched (case-insensitively) ' +
      'against title, author, and genre. Returns the matching books. Use this to answer ' +
      'questions like "find books by Orwell" or "what sci-fi do we have".',
    inputSchema: {
      query: z.string().describe('Text to match against title, author, or genre.'),
    },
  },
  async ({ query }) => {
    const q = query.trim().toLowerCase();
    if (!q) return json([]);

    const books = await getBooks();
    const matches = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q),
    );
    return json(matches);
  },
);

server.registerTool(
  'get_book_stats',
  {
    title: 'Get book stats',
    description:
      'Return aggregate statistics about the catalogue: total number of books, a count of ' +
      'books per genre, and the 5 most recently added books. Use this for questions like ' +
      '"how many books are there" or "what was added recently".',
    inputSchema: {},
  },
  async () => {
    const books = await getBooks();

    const booksPerGenre: Record<string, number> = {};
    for (const book of books) {
      booksPerGenre[book.genre] = (booksPerGenre[book.genre] ?? 0) + 1;
    }

    const recentlyAdded = [...books]
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
      .slice(0, 5)
      .map((b) => ({ id: b.id, title: b.title, addedAt: b.addedAt }));

    return json({ totalBooks: books.length, booksPerGenre, recentlyAdded });
  },
);

server.registerTool(
  'get_shelf_contents',
  {
    title: 'Get shelf contents',
    description:
      'Return the books on a shelf, looked up by shelf name (case-insensitive, e.g. ' +
      '"Currently Reading") or shelf id (e.g. "shelf_001"). Returns the shelf plus its ' +
      'resolved books.',
    inputSchema: {
      shelf: z.string().describe('Shelf name (e.g. "Finished") or id (e.g. "shelf_001").'),
    },
  },
  async ({ shelf }) => {
    const needle = shelf.trim().toLowerCase();
    const shelves = await getShelves();
    const match = shelves.find(
      (s) => s.id.toLowerCase() === needle || s.name.toLowerCase() === needle,
    );

    if (!match) {
      return json({ error: `No shelf matching '${shelf}'`, availableShelves: shelves.map((s) => s.name) });
    }

    const books = await getBooks();
    const byId = new Map(books.map((b) => [b.id, b]));
    const shelfBooks = match.bookIds.map((id) => byId.get(id)).filter(Boolean);

    return json({ shelf: { id: match.id, name: match.name }, count: shelfBooks.length, books: shelfBooks });
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
