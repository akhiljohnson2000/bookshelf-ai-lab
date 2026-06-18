# BookShelf — Copilot instructions

BookShelf is an Express + TypeScript book-catalogue API (monorepo) with a Vite/React
frontend. All data is JSON files in `/data` — there is no database.

## Conventions
- Success responses: `{ success: true, data }` (use `201` on create). List endpoints add `meta`.
- Errors: `throw` an `AppError` subclass; the `errorHandler` formats `{ success: false, error: { message, code } }`. Never `res.send` raw strings.
- Validation goes in middleware, not route handlers.
- Routes are thin and call services; services hold business logic.
- Use the data layer (`apps/api/src/data/`) — never read or write `/data/*.json` or import `fs` from routes/services.
- IDs are prefixed, zero-padded strings: `book_001`.
- Early returns. Named exports, not default exports. No `any` — use `unknown`. ESM imports use `.js` extensions.

## Don't
- Don't add a database or new npm dependencies.
- Don't use `console.log`.
- Don't edit `packages/shared` without checking consumers in `apps/api`.
