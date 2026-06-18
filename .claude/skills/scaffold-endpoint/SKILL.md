---
name: scaffold-endpoint
description: Scaffold a new BookShelf API endpoint (route + service + repository + validation + test) following the project's conventions. Use when asked to add, scaffold, or create a new REST endpoint for the API.
---

# Scaffold a BookShelf API endpoint

Generate a new endpoint that looks like it was written by someone who's been on this
project for months. Follow the layered architecture and conventions exactly — do not
invent new shapes.

## When to use
- "Add a `POST /api/books/:id/reviews` endpoint", "scaffold the shelves endpoints", "create a `GET /api/reviews/:id` route", etc.

## First, classify the endpoint — it changes the wiring
- **Sub-resource of an existing entity** (e.g. `/books/:id/reviews`): add the route(s)
  to the existing parent router (`books.routes.ts`). No new mount needed.
- **Brand-new top-level resource** (e.g. `/api/shelves`): you must ALSO
  (a) create a new `apps/api/src/routes/<entity>.routes.ts`, and
  (b) register it in `apps/api/src/app.ts`:
  `app.use(\`${config.apiBasePath}/<entity>\`, <entity>Router);`
  Forgetting (b) is the most common scaffolding miss — the routes exist but 404.

## Steps (in order)
1. **Types** — if the request body is new, add a `CreateXPayload` interface to
   `packages/shared/src/types/index.ts` (next to the entity's type). Rebuild shared:
   `npm run build --workspace=@bookshelf/shared`.
2. **Repository** — `apps/api/src/data/<entity>.repository.ts` (entity-scoped `entity.role.ts` name).
   - Reads via `readJson`, mutations via `updateJson` (atomic). NEVER touch `fs` directly.
   - New ids: prefixed, zero-padded, incrementing the highest existing (`<entity>_NNN`, e.g. `review_001`).
   - Reject duplicates by `throw`ing `ConflictError` INSIDE the `updateJson` updater.
3. **Service** — `apps/api/src/services/<entity>.service.ts`. Holds business logic
   (filtering, pagination, search), not the repository.
   - For sub-resources, validate the parent exists first (e.g. `booksRepository.requireBookById(id)`
     → throws `NotFoundError` → 404).
4. **Validation** — if there's a body, add `validateXPayload` middleware in
   `apps/api/src/middleware/` (generic utilities are camelCase, not `entity.role.ts`).
   Collect ALL field errors, then `next(new ValidationError(msg, details))` where `details`
   is field-keyed (`{ rating: "rating must be an integer between 1 and 5" }`). Normalize `req.body` after.
5. **Route** — thin handler in the correct `*.routes.ts` (see classification above).
   Parse params, call the service, send the envelope. Wrap in `try/catch` + `next(error)`.
   Apply validation middleware on writes.
   - **Route order matters:** Express matches in declaration order. Put literal/specific
     paths (`/search`, `/:id/reviews`) BEFORE bare `/:id` so they aren't shadowed.
6. **Test** — mutations (POST/PUT/DELETE): smoke-test with the `test` skill (throwaway data).
   Pure logic (search/filter/pagination): add a Vitest unit test next to the service
   (`*.service.test.ts`) mocking the data layer.
7. **Docs** — update the *Current state* section in `CLAUDE.md` to list the new endpoint.

## Constraints
- Responses use `@bookshelf/shared` types: single → `SuccessResponse<T>` `{ success: true, data }`
  (`201` on create); list → `PaginatedResponse<T>` `{ success: true, data, meta }`;
  errors are thrown as `AppError` subclasses (never hand-built JSON).
- Validation lives in middleware, NOT in route handlers. Routes stay thin.
- Use the data layer; never read/write `/data/*.json` from routes or services.
- Early returns; named exports; no `any`; ESM `.js` import extensions.
- No new npm dependencies without discussing first.

## Reference implementations (copy these shapes)
- Route + create: `apps/api/src/routes/books.routes.ts` (`POST /`, `POST /:id/reviews`)
- Repository mutation with conflict + id-gen: `apps/api/src/data/books.repository.ts` (`createBook`)
- Field-keyed validation: `apps/api/src/middleware/validateBookPayload.ts`
- List with pagination `meta`: `apps/api/src/services/books.service.ts` (`listBooks`)

Route + repository skeleton:
```ts
// route — thin: parse, delegate, send the envelope
router.post('/', validateBookPayload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await booksService.createBook(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

// repository — atomic mutation, reject duplicates inside the updater
export async function createBook(payload: CreateBookPayload): Promise<Book> {
  let created: Book | undefined;
  await updateJson<Book[]>(dataFiles.books, (books) => {
    if (books.some((b) => b.isbn === payload.isbn)) {
      throw new ConflictError(`A book with ISBN ${payload.isbn} already exists`);
    }
    created = { id: generateNextBookId(books), ...payload, coverUrl: payload.coverUrl ?? null,
      addedAt: new Date().toISOString() };
    return [...books, created];
  });
  return created!;
}
```

## Optional user instructions
$ARGUMENTS
